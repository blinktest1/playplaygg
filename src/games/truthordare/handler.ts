/**
 * handler.ts — 真心话大冒险
 *
 * 流程：选模式(破冰/进阶/激情) → 加入 → 开始 → 随机点人 → 选真心话/大冒险 → 出题 → 下一位
 */
import { Context, Markup, Telegraf } from 'telegraf';
import { getChatLanguage, setChatTimeout, clearChatTimeout } from '../../state';
import { getTexts } from '../../i18n';
import { logger, errMsg } from '../../logger';
import { shuffle } from '../../utils';
import { pickQuestion } from './questions';
import type { TodTier } from './questions';
import {
  TOD_MIN_PLAYERS,
  TOD_MAX_PLAYERS,
  TOD_SESSION_TIMEOUT_MS,
  TOD_ANSWER_TIMEOUT_MS,
  type TodPlayer,
  type TodSession,
} from './types';

// ─── In-memory session store ─────────────────────────────────────────────────

const sessions = new Map<number, TodSession>();

function getSession(chatId: number): TodSession | undefined {
  const s = sessions.get(chatId);
  if (!s || !s.active) return undefined;
  if (Date.now() - s.lastActivity > TOD_SESSION_TIMEOUT_MS) {
    sessions.delete(chatId);
    return undefined;
  }
  return s;
}

function touch(session: TodSession): void {
  session.lastActivity = Date.now();
}

// ─── Core: ask the current player ────────────────────────────────────────────

async function askCurrentPlayer(
  bot: Telegraf<Context>,
  chatId: number,
): Promise<void> {
  const session = getSession(chatId);
  if (!session) return;

  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  if (session.currentIndex >= session.players.length) {
    session.players = shuffle(session.players);
    session.currentIndex = 0;
  }

  const player = session.players[session.currentIndex];
  touch(session);

  const todT = t.truthOrDare;
  const nameDisplay = player.username ? `@${player.username}` : player.name;

  await bot.telegram.sendMessage(
    chatId,
    todT.yourTurn(nameDisplay),
    {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.callback(todT.btnTruth, `tod_choose_${chatId}_truth_${player.userId}`),
          Markup.button.callback(todT.btnDare, `tod_choose_${chatId}_dare_${player.userId}`),
        ],
        [
          Markup.button.callback(todT.btnSkip, `tod_skip_${chatId}_${player.userId}`),
        ],
      ]).reply_markup,
    },
  );

  setChatTimeout(chatId, `tod_answer`, () => {
    const s = getSession(chatId);
    if (!s) return;
    s.currentIndex += 1;
    void (async () => {
      try {
        const lang2 = await getChatLanguage(chatId);
        const t2 = getTexts(lang2);
        await bot.telegram.sendMessage(chatId, t2.truthOrDare.timeoutSkipped(nameDisplay));
        await askCurrentPlayer(bot, chatId);
      } catch (err) {
        logger.error({ chatId, err: errMsg(err) }, 'tod auto-skip error');
      }
    })();
  }, TOD_ANSWER_TIMEOUT_MS);
}

// ─── Register ────────────────────────────────────────────────────────────────

export function registerTruthOrDare(bot: Telegraf<Context>) {

  // Periodic cleanup: purge stale sessions every 5 minutes to prevent memory leak.
  // getSession() only cleans on access; sessions abandoned without interaction stay forever.
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [chatId, s] of sessions) {
      if (now - s.lastActivity > TOD_SESSION_TIMEOUT_MS) {
        clearChatTimeout(chatId, `tod_answer`);
        sessions.delete(chatId);
      }
    }
  }, 5 * 60 * 1000);
  cleanupInterval.unref(); // don't block process exit

  // Step 1: 从主菜单点击 → 选择模式
  bot.action('start_tod', async (ctx) => {
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

      const existing = sessions.get(chatId);
      if (existing) {
        await ctx.reply(t.truthOrDare.alreadyRunning);
        return;
      }

      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      // Show tier selection
      await ctx.reply(
        t.truthOrDare.chooseTier,
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(t.truthOrDare.tierIcebreaker, `tod_tier_${chatId}_icebreaker`)],
            [Markup.button.callback(t.truthOrDare.tierAdvanced, `tod_tier_${chatId}_advanced`)],
            [Markup.button.callback(t.truthOrDare.tierSpicy, `tod_tier_${chatId}_spicy`)],
          ]).reply_markup,
        },
      );
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'start_tod error');
    }
  });

  // Step 2: 选完模式 → 进入报名
  bot.action(/^tod_tier_(-?\d+)_(icebreaker|advanced|spicy)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const tier = ctx.match[2] as TodTier;
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);

      await ctx.answerCbQuery();

      // Check no existing session
      const existing = sessions.get(chatId);
      if (existing?.active) {
        await ctx.reply(t.truthOrDare.alreadyRunning);
        return;
      }

      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      const tierLabel =
        tier === 'icebreaker' ? t.truthOrDare.tierIcebreaker :
        tier === 'advanced' ? t.truthOrDare.tierAdvanced :
        t.truthOrDare.tierSpicy;

      // Create session in recruiting state
      sessions.set(chatId, {
        chatId,
        players: [],
        currentIndex: 0,
        tier,
        active: false,
        lastActivity: Date.now(),
      });

      await ctx.reply(
        t.truthOrDare.recruitText(TOD_MIN_PLAYERS, TOD_MAX_PLAYERS, tierLabel),
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(t.truthOrDare.btnJoin, `tod_join_${chatId}`)],
            [Markup.button.callback(t.truthOrDare.btnStart, `tod_go_${chatId}`)],
          ]).reply_markup,
        },
      );
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'tod_tier error');
    }
  });

  // 加入
  bot.action(/^tod_join_(-?\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);
      const session = sessions.get(chatId);

      if (!session) {
        await ctx.answerCbQuery(t.truthOrDare.sessionEnded, { show_alert: false });
        return;
      }
      if (session.active) {
        await ctx.answerCbQuery(t.truthOrDare.alreadyStarted, { show_alert: false });
        return;
      }

      const from = ctx.from;
      if (!from) return;

      if (session.players.find((p) => p.userId === from.id)) {
        await ctx.answerCbQuery(t.truthOrDare.alreadyJoined, { show_alert: false });
        return;
      }
      if (session.players.length >= TOD_MAX_PLAYERS) {
        await ctx.answerCbQuery(t.truthOrDare.full, { show_alert: true });
        return;
      }

      session.players.push({
        userId: from.id,
        name: from.first_name || from.last_name || from.username || '?',
        username: from.username,
      });
      session.lastActivity = Date.now();

      const names = session.players.map((p) => p.name).join(', ');
      await ctx.answerCbQuery(t.truthOrDare.joined, { show_alert: false });

      const tierLabel =
        session.tier === 'icebreaker' ? t.truthOrDare.tierIcebreaker :
        session.tier === 'advanced' ? t.truthOrDare.tierAdvanced :
        t.truthOrDare.tierSpicy;

      try {
        await ctx.editMessageText(
          t.truthOrDare.recruitTextWithPlayers(
            TOD_MIN_PLAYERS, TOD_MAX_PLAYERS,
            session.players.length, names, tierLabel,
          ),
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback(t.truthOrDare.btnJoin, `tod_join_${chatId}`)],
              [Markup.button.callback(t.truthOrDare.btnStart, `tod_go_${chatId}`)],
            ]).reply_markup,
          },
        );
      } catch {}
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'tod_join error');
    }
  });

  // 开始游戏
  bot.action(/^tod_go_(-?\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);
      const session = sessions.get(chatId);

      if (!session) {
        await ctx.answerCbQuery(t.truthOrDare.sessionEnded, { show_alert: false });
        return;
      }
      if (session.active) {
        await ctx.answerCbQuery(t.truthOrDare.alreadyStarted, { show_alert: false });
        return;
      }
      if (session.players.length < TOD_MIN_PLAYERS) {
        await ctx.answerCbQuery(
          t.truthOrDare.notEnough(session.players.length, TOD_MIN_PLAYERS),
          { show_alert: true },
        );
        return;
      }

      await ctx.answerCbQuery();
      session.active = true;
      session.players = shuffle(session.players);
      session.currentIndex = 0;
      touch(session);

      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      const tierLabel =
        session.tier === 'icebreaker' ? t.truthOrDare.tierIcebreaker :
        session.tier === 'advanced' ? t.truthOrDare.tierAdvanced :
        t.truthOrDare.tierSpicy;
      await bot.telegram.sendMessage(
        chatId,
        t.truthOrDare.gameStarted(session.players.length, tierLabel),
      );

      await askCurrentPlayer(bot, chatId);
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'tod_go error');
    }
  });

  // 选择真心话/大冒险
  bot.action(/^tod_choose_(-?\d+)_(truth|dare)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const type = ctx.match[2] as 'truth' | 'dare';
      const targetUserId = Number(ctx.match[3]);
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);

      const session = getSession(chatId);
      if (!session) {
        await ctx.answerCbQuery(t.truthOrDare.sessionEnded, { show_alert: false });
        return;
      }

      if (ctx.from?.id !== targetUserId) {
        await ctx.answerCbQuery(t.truthOrDare.notYourTurn, { show_alert: true });
        return;
      }

      await ctx.answerCbQuery();
      clearChatTimeout(chatId, `tod_answer`);

      const question = pickQuestion(lang, session.tier, type);
      const label = type === 'truth' ? t.truthOrDare.truthLabel : t.truthOrDare.dareLabel;
      const player = session.players[session.currentIndex];
      const nameDisplay = player?.username ? `@${player.username}` : (player?.name ?? '?');

      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      await bot.telegram.sendMessage(
        chatId,
        t.truthOrDare.questionFor(nameDisplay, label, question),
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback(t.truthOrDare.btnNext, `tod_next_${chatId}`)],
            [Markup.button.callback(t.truthOrDare.btnEndGame, `tod_end_${chatId}`)],
          ]).reply_markup,
        },
      );

      touch(session);
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'tod_choose error');
    }
  });

  // 跳过
  bot.action(/^tod_skip_(-?\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const targetUserId = Number(ctx.match[2]);
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);

      const session = getSession(chatId);
      if (!session) {
        await ctx.answerCbQuery(t.truthOrDare.sessionEnded, { show_alert: false });
        return;
      }

      if (ctx.from?.id !== targetUserId) {
        await ctx.answerCbQuery(t.truthOrDare.notYourTurn, { show_alert: true });
        return;
      }

      await ctx.answerCbQuery();
      clearChatTimeout(chatId, `tod_answer`);
      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      session.currentIndex += 1;
      touch(session);
      await askCurrentPlayer(bot, chatId);
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'tod_skip error');
    }
  });

  // 下一位
  bot.action(/^tod_next_(-?\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);

      const session = getSession(chatId);
      if (!session) {
        await ctx.answerCbQuery(t.truthOrDare.sessionEnded, { show_alert: false });
        return;
      }

      const userId = ctx.from?.id;
      if (!userId || !session.players.some((p) => p.userId === userId)) {
        await ctx.answerCbQuery(t.truthOrDare.notInGame, { show_alert: true });
        return;
      }

      await ctx.answerCbQuery();
      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      session.currentIndex += 1;
      touch(session);
      await askCurrentPlayer(bot, chatId);
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'tod_next error');
    }
  });

  // 结束游戏
  bot.action(/^tod_end_(-?\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);

      const session = getSession(chatId);
      if (!session) {
        await ctx.answerCbQuery(t.truthOrDare.sessionEnded, { show_alert: false });
        return;
      }

      await ctx.answerCbQuery();
      clearChatTimeout(chatId, `tod_answer`);
      sessions.delete(chatId);
      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      await bot.telegram.sendMessage(chatId, t.truthOrDare.gameEnded);
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'tod_end error');
    }
  });
}
