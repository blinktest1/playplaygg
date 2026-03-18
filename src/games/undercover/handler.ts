/**
 * handler.ts — Telegraf 事件注册（bot.action / bot.start / bot.on）
 * 纯路由层，业务逻辑委托给 engine.ts
 */
import { Context, Telegraf } from 'telegraf';
import { getChatLanguage, setChatTimeout } from '../../state';
import { getTexts } from '../../i18n';
import { tryAcquireRoom, releaseRoom, getChatRoomUsage } from '../../roomQuota';
import { logger, errMsg } from '../../logger';
import { castVote, createRoom, endRoom, getActiveRooms, getAllRoomsByChat, getRoom, saveRoom } from './redisRooms';
import { COUNTDOWN_MS, MAX_PLAYERS, MIN_PLAYERS } from './types';
import {
  beginSpeakingRound,
  handleExpiredDeadline,
  hasActiveResolver,
  pendingUndercoverResolvers,
  startUndercoverGame,
  timerKey,
} from './engine';
import { buildGroupReturnLink, sendRoomMessage } from './messages';

// ─── Polling (restart recovery) ───────────────────────────────────────────────

function startUndercoverPolling(bot: Telegraf<Context>) {
  const INTERVAL_MS = 10_000;
  setInterval(async () => {
    try {
      const now = Date.now();
      const allRooms = await getAllRoomsByChat();
      for (const [, list] of allRooms) {
        for (const room of list) {
          if (!room.active) continue;

          // Legacy countdown via createdAt
          if (
            room.state.phase === 'waiting' &&
            room.createdAt != null &&
            now - room.createdAt >= COUNTDOWN_MS
          ) {
            room.createdAt = undefined;
            room.phaseDeadline = undefined;
            room.phaseDeadlineType = undefined;
            await saveRoom(room);
            void startUndercoverGame(bot, room).catch((err) =>
              logger.error({ chatId: room.chatId, err: errMsg(err) }, '轮询启动游戏异常'),
            );
            continue;
          }

          // phaseDeadline expired and no active in-process resolver
          if (
            room.phaseDeadline != null &&
            now >= room.phaseDeadline &&
            !hasActiveResolver(room.chatId, room.roomId)
          ) {
            const deadlineType = room.phaseDeadlineType;
            room.phaseDeadline = undefined;
            room.phaseDeadlineType = undefined;
            await saveRoom(room);
            void handleExpiredDeadline(bot, room, deadlineType).catch((err) =>
              logger.error({ chatId: room.chatId, err: errMsg(err) }, 'polling deadline handler error'),
            );
          }
        }
      }
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'undercover polling error');
    }
  }, INTERVAL_MS);
}

// ─── registerUndercover ───────────────────────────────────────────────────────

export function registerUndercover(bot: Telegraf<Context>) {
  startUndercoverPolling(bot);

  // 群内点击「开始谁是卧底」→ 创建房间 + 报名倒计时
  bot.action('start_undercover', async (ctx) => {
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

      if (!(await tryAcquireRoom(chatId, 'undercover'))) {
        const usage = await getChatRoomUsage(chatId);
        await ctx.reply(t.common.roomFull(usage.used, usage.max));
        return;
      }

      const newRoom = await createRoom(chatId);
      if (!newRoom) {
        const usage = await getChatRoomUsage(chatId);
        await ctx.reply(t.undercover.roomFull(usage.used, usage.max));
        await releaseRoom(chatId, 'undercover');
        return;
      }

      const chat = ctx.chat as { username?: string };
      if (chat?.username) newRoom.username = chat.username;

      const botUsername = ctx.botInfo?.username;
      if (!botUsername) {
        await ctx.reply(t.errors.generic);
        return;
      }

      const payload = `undercover_${chatId}_${newRoom.roomId}`;
      const deepLink = `https://t.me/${botUsername}?start=${payload}`;
      const joinText = t.undercover.joinStartText(deepLink, MIN_PLAYERS, MAX_PLAYERS, 35);

      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      const sent = await sendRoomMessage(bot, chatId, newRoom.roomId, joinText);
      if (sent?.message_id) newRoom.recruitmentMessageId = sent.message_id;
      newRoom.phaseDeadline = Date.now() + COUNTDOWN_MS;
      newRoom.phaseDeadlineType = 'countdown';
      await saveRoom(newRoom);

      setChatTimeout(chatId, timerKey(newRoom, 'countdown_10'), async () => {
        const texts = getTexts(await getChatLanguage(chatId));
        await sendRoomMessage(bot, chatId, newRoom.roomId, texts.undercover.countdown10s);
      }, COUNTDOWN_MS - 10_000);

      const roomChatId = newRoom.chatId;
      const roomId = newRoom.roomId;
      setChatTimeout(chatId, timerKey(newRoom, 'start'), () => {
        void (async () => {
          const room = await getRoom(roomChatId, roomId);
          if (!room?.active) {
            try {
              const txt = getTexts(await getChatLanguage(roomChatId));
              await bot.telegram.sendMessage(roomChatId, txt.common.roomClosedOrNotFound);
            } catch (e) {
              logger.error({ chatId: roomChatId, err: errMsg(e) }, '房间未找到时发信异常');
            }
            return;
          }
          try {
            await startUndercoverGame(bot, room);
          } catch (err) {
            const errStr = (err as Error)?.message ?? String(err);
            logger.error({ chatId: roomChatId, roomId, err: errMsg(err) }, '倒计时结束启动异常');
            try {
              const txt = getTexts(await getChatLanguage(roomChatId));
              const isRightsError =
                /rights|permission|forbidden|blocked|chat not found|not found|can't send|cannot send/i.test(errStr);
              const msg =
                isRightsError && txt.undercover.startFailedNoRights
                  ? txt.undercover.startFailedNoRights
                  : (txt.undercover.startFailed ?? txt.errors.generic);
              await sendRoomMessage(bot, roomChatId, roomId, msg);
            } catch {}
          }
        })();
      }, COUNTDOWN_MS);
    } catch (err) {
      logger.error({ err: errMsg(err) }, '处理 start_undercover 异常');
    }
  });

  // 私聊 /start 报名
  bot.start(async (ctx) => {
    const rawPayload =
      ctx.startPayload ??
      ('text' in (ctx.message || {})
        ? String((ctx.message as { text?: string }).text || '')
            .replace(/^\/start\s*/, '')
            .trim()
        : '');
    const payload = rawPayload || '';
    if (!payload.startsWith('undercover_')) return;

    try {
      const parts = payload.split('_');
      const chatId = Number(parts[1]);
      const roomId = Number(parts[2]);
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);

      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) {
        await ctx.reply(t.common.roomClosedOrNotFound);
        return;
      }

      const room = await getRoom(chatId, roomId);
      if (!room?.active) { await ctx.reply(t.common.roomClosedOrNotFound); return; }
      if (room.state.phase !== 'waiting') { await ctx.reply(t.undercover.linkExpiredGameStarted); return; }

      const from = ctx.from;
      if (!from) { await ctx.reply(t.errors.generic); return; }

      const groupLink = buildGroupReturnLink(room);
      const joinMsg =
        t.undercover.joinSuccessWithReturnLink?.(groupLink) ??
        `${t.undercover.joinSuccess}\n返回组群 👉 <a href="${groupLink}">点击返回</a>`;

      if (room.state.players.find((p) => p.userId === from.id)) {
        await ctx.reply(joinMsg, { parse_mode: 'HTML' });
        return;
      }
      if (room.state.players.length >= MAX_PLAYERS) {
        await ctx.reply(t.undercover.linkExpiredRoomFull(MAX_PLAYERS));
        return;
      }

      room.state.players.push({
        userId: from.id,
        name: from.first_name || from.last_name || from.username || '?',
        username: from.username,
        alive: true,
      });
      await saveRoom(room);
      await ctx.reply(joinMsg, { parse_mode: 'HTML' });

      const t2 = getTexts(await getChatLanguage(chatId));
      const names = room.state.players.map((p) => p.name).join(', ');
      await bot.telegram.sendMessage(
        chatId,
        t2.undercover.currentRoomPlayers(room.roomId, room.state.players.length, names),
      );
    } catch (err) {
      logger.error({ err: errMsg(err) }, '处理 /start 报名异常');
      const chatId = ctx.chat?.id;
      const tErr = getTexts(typeof chatId === 'number' ? await getChatLanguage(chatId) : 'ru');
      await ctx.reply(tErr.errors.generic);
    }
  });

  // 结束发言（仅当前发言人）
  bot.action(/^undercover_skip_turn_(-?\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) return;
      const t = getTexts(await getChatLanguage(chatId));
      const mapKey = `undercover_${chatId}_${roomId}_speaking`;
      const pending = pendingUndercoverResolvers.get(mapKey);
      if (!pending) {
        await ctx.answerCbQuery(t.undercover.alreadyEnded ?? 'Ended', { show_alert: false });
        return;
      }
      if (ctx.from?.id !== pending.currentUserId) {
        await ctx.answerCbQuery(t.undercover.notYourTurn ?? 'Not your turn', { show_alert: true });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve();
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'skip_turn 按键异常');
    }
  });

  // 结束回合（自由讨论，任何玩家可点）
  bot.action(/^undercover_skip_freetalk_(-?\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) return;
      const t = getTexts(await getChatLanguage(chatId));
      const room = await getRoom(chatId, roomId);
      if (!room?.active) {
        await ctx.answerCbQuery(t.undercover.roundEnded, { show_alert: false });
        return;
      }
      const userId = ctx.from?.id;
      if (userId == null || !room.state.players.some((p) => p.userId === userId)) {
        await ctx.answerCbQuery(t.undercover.notInThisGame, { show_alert: true });
        return;
      }
      const pending = pendingUndercoverResolvers.get(`undercover_${chatId}_${roomId}_freetalk`);
      if (!pending) {
        await ctx.answerCbQuery(t.undercover.alreadyEnded ?? 'Ended', { show_alert: false });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve();
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'skip_freetalk 按键异常');
    }
  });

  // 结束游戏（inline button callback）
  bot.action(/^undercover_force_end_(-?\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) return;
      const t = getTexts(await getChatLanguage(chatId));
      const pending = pendingUndercoverResolvers.get(`undercover_${chatId}_${roomId}_vote`);
      if (!pending) {
        await ctx.answerCbQuery(t.undercover.alreadyEnded ?? 'Ended', { show_alert: false });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve({ forceEnd: true });
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'force_end 按键异常');
    }
  });

  // Inline button 投票
  bot.action(/^uc_vote_(-?\d+)_(\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      const targetId = Number(ctx.match[3]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId) || !Number.isFinite(targetId)) return;

      const voterId = ctx.from?.id;
      if (!voterId) return;

      const t = getTexts(await getChatLanguage(chatId));
      const room = await getRoom(chatId, roomId);

      if (!room?.active || room.state.phase !== 'voting') {
        await ctx.answerCbQuery(t.undercover.alreadyEnded ?? 'Ended', { show_alert: false });
        return;
      }

      // 验证投票人在游戏中且存活
      const voter = room.state.players.find((p) => p.userId === voterId && p.alive);
      if (!voter) {
        await ctx.answerCbQuery(t.undercover.notInThisGame, { show_alert: true });
        return;
      }

      // 验证投票目标存活
      const target = room.state.players.find((p) => p.userId === targetId && p.alive);
      if (!target) {
        await ctx.answerCbQuery(t.undercover.invalidVoteTarget, { show_alert: true });
        return;
      }

      // 不能投自己
      if (voterId === targetId) {
        await ctx.answerCbQuery(t.undercover.cannotVoteSelf, { show_alert: true });
        return;
      }

      // 原子写入投票（无 race condition）
      const ok = await castVote(chatId, roomId, voterId, targetId);
      if (!ok) {
        await ctx.answerCbQuery(t.undercover.alreadyEnded ?? 'Ended', { show_alert: false });
        return;
      }

      await ctx.answerCbQuery(t.undercover.voteDone(target.name), { show_alert: false });
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'uc_vote 按键异常');
    }
  });
}
