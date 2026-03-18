/**
 * GameEngine.ts — 新游戏脚手架基类
 *
 * 每个新游戏继承此类，实现抽象方法，即可获得：
 *   - 统一的房间创建/报名/倒计时流程
 *   - roomQuota 接入
 *   - 结构化日志
 *
 * 使用示例（新游戏）：
 *
 *   export class WordBombEngine extends GameEngine<WordBombRoom> {
 *     gameName = 'wordbomb';
 *     minPlayers = 2;
 *     maxPlayers = 10;
 *     getIntroText(lang: LanguageCode) { return getTexts(lang).wordBomb.intro; }
 *     async onGameStart(bot, room) { ... }
 *   }
 *
 *   // 注册：
 *   new WordBombEngine(bot).register();
 */
import { Context, Telegraf } from 'telegraf';
import { getChatLanguage, setChatTimeout } from '../../state';
import { getTexts } from '../../i18n';
import { tryAcquireRoom, releaseRoom, getChatRoomUsage } from '../../roomQuota';
import { logger, errMsg } from '../../logger';
import type { LanguageCode } from '../../state';
import type { BaseRoom, BasePlayer } from './RoomRepository';

export type { BaseRoom, BasePlayer };

// ─── GameEngine ───────────────────────────────────────────────────────────────

export abstract class GameEngine<TRoom extends BaseRoom> {
  protected bot: Telegraf<Context>;

  constructor(bot: Telegraf<Context>) {
    this.bot = bot;
  }

  // ── Required by subclass ──────────────────────────────────────────────────

  /** Short lowercase key used in roomQuota, Redis, action IDs: e.g. 'undercover' */
  abstract readonly gameName: string;
  abstract readonly minPlayers: number;
  abstract readonly maxPlayers: number;

  /** Localised intro / join text shown when recruiting players */
  abstract getIntroText(lang: LanguageCode, deepLink: string, seconds: number): string;

  /** Localised "10 seconds remaining" countdown text */
  abstract getCountdownWarningText(lang: LanguageCode): string;

  /** Localised "not enough players, game cancelled" text */
  abstract getStartCancelledText(lang: LanguageCode, currentPlayers: number, minPlayers: number): string;

  /** Called once enough players have joined and the countdown expires */
  abstract onGameStart(bot: Telegraf<Context>, room: TRoom): Promise<void>;

  /** Create and persist a new room for the given chat */
  abstract createRoom(chatId: number): Promise<TRoom | null>;

  /** Load a room from storage */
  abstract getRoom(chatId: number, roomId: number): Promise<TRoom | null>;

  /** Persist room changes */
  abstract saveRoom(room: TRoom): Promise<void>;

  /** Mark room as finished and free storage */
  abstract endRoom(room: TRoom): Promise<void>;

  // ── Optional overrides ────────────────────────────────────────────────────

  /** Countdown duration in ms (default 35 s) */
  get countdownMs(): number { return 35_000; }

  /** Deep-link payload prefix (default: gameName) */
  get payloadPrefix(): string { return this.gameName; }

  // ── Shared logic ──────────────────────────────────────────────────────────

  /**
   * Add a player to the room. Override for custom join validation.
   * Returns false if join was rejected (room full, already joined, etc.)
   */
  async handleJoin(
    room: TRoom,
    user: { id: number; first_name?: string; last_name?: string; username?: string },
  ): Promise<'ok' | 'already_joined' | 'room_full'> {
    if (room.state.players.find((p) => p.userId === user.id)) return 'already_joined';
    if (room.state.players.length >= this.maxPlayers) return 'room_full';
    room.state.players.push({
      userId: user.id,
      name: user.first_name || user.last_name || user.username || '?',
      username: user.username,
    });
    await this.saveRoom(room);
    return 'ok';
  }

  /**
   * Announce countdown ticks and schedule game start.
   * Call this after room is created and recruitment message is sent.
   */
  runCountdown(chatId: number, room: TRoom): void {
    const roomId = room.roomId;
    const warnKey = `${this.gameName}_${roomId}_countdown_10` as import('../../state').TimerKey;
    const startKey = `${this.gameName}_${roomId}_start` as import('../../state').TimerKey;

    // 10 s remaining warning
    setChatTimeout(chatId, warnKey, async () => {
      try {
        const lang = await getChatLanguage(chatId);
        await this.bot.telegram.sendMessage(chatId, this.getCountdownWarningText(lang));
      } catch (e) {
        logger.warn({ chatId, game: this.gameName, err: errMsg(e) }, 'countdown warning send failed');
      }
    }, this.countdownMs - 10_000);

    // Game start
    setChatTimeout(chatId, startKey, () => {
      void (async () => {
        const latest = await this.getRoom(chatId, roomId);
        if (!latest?.active) return;
        if (latest.state.players.length < this.minPlayers) {
          const lang = await getChatLanguage(chatId);
          const msg = this.getStartCancelledText(lang, latest.state.players.length, this.minPlayers);
          await this.bot.telegram.sendMessage(chatId, msg);
          await this.endRoom(latest);
          await releaseRoom(chatId, this.gameName);
          return;
        }
        try {
          await this.onGameStart(this.bot, latest);
        } catch (err) {
          logger.error({ chatId, roomId, game: this.gameName, err: errMsg(err) }, 'onGameStart failed');
          await releaseRoom(chatId, this.gameName);
        }
      })();
    }, this.countdownMs);
  }

  /**
   * Register bot.action handler for the "create room" button.
   * Action ID: `start_${gameName}`
   */
  registerCreateAction(): void {
    this.bot.action(`start_${this.gameName}`, async (ctx) => {
      try {
        await ctx.answerCbQuery();
        if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
          const lang = await getChatLanguage(ctx.chat?.id ?? 0);
          await ctx.reply(getTexts(lang).common.onlyGroups);
          return;
        }

        const chatId = ctx.chat.id;
        const lang = await getChatLanguage(chatId);
        const t = getTexts(lang);

        if (!(await tryAcquireRoom(chatId, this.gameName))) {
          const usage = await getChatRoomUsage(chatId);
          await ctx.reply(t.common.roomFull(usage.used, usage.max));
          return;
        }

        const room = await this.createRoom(chatId);
        if (!room) {
          const usage = await getChatRoomUsage(chatId);
          await ctx.reply(t.common.roomFull(usage.used, usage.max));
          await releaseRoom(chatId, this.gameName);
          return;
        }

        const chat = ctx.chat as { username?: string };
        if (chat?.username) (room as BaseRoom).username = chat.username;

        const botUsername = ctx.botInfo?.username;
        if (!botUsername) { await ctx.reply(t.errors.generic); return; }

        const payload = `${this.payloadPrefix}_${chatId}_${room.roomId}`;
        const deepLink = `https://t.me/${botUsername}?start=${payload}`;
        const introText = this.getIntroText(lang, deepLink, this.countdownMs / 1000);

        try { await ctx.editMessageReplyMarkup(undefined); } catch {}

        const sent = await ctx.reply(introText, { parse_mode: 'HTML' });
        if (sent?.message_id) (room as BaseRoom).recruitmentMessageId = sent.message_id;
        await this.saveRoom(room);

        this.runCountdown(chatId, room);

        logger.info({ chatId, roomId: room.roomId, game: this.gameName }, 'room created');
      } catch (err) {
        logger.error({ game: this.gameName, err: errMsg(err) }, 'createAction error');
      }
    });
  }

  /**
   * Register the /start deep-link join handler.
   * Subclasses can override for custom join flow.
   */
  registerJoinHandler(): void {
    // Implemented by each game's handler.ts since join flow is game-specific.
    // Provided here as a no-op hook so subclasses can call super.register().
  }

  /** Register all bot handlers. Call once at startup. */
  register(): void {
    this.registerCreateAction();
    this.registerJoinHandler();
  }
}
