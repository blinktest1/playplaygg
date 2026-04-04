/**
 * anonymous.ts — 匿名大字报 (Anonymous Wall)
 *
 * 流程：群内发起 → 选话题(预设/自定义) → 生成 deep link → 成员私聊 bot 发匿名内容 → 转发到群
 * 发 /quit 结束收集
 */
import { Context, Markup, Telegraf } from 'telegraf';
import { getChatLanguage, getOrCreateChatState, setChatState, resetChatState } from '../state';
import { getTexts } from '../i18n';
import { logger, errMsg } from '../logger';
import { trackGroupMessage } from '../stats';
import { LruMap } from '../lruMap';

// ─── In-memory session: userId → target chatId for anonymous forwarding ──────

const anonSessions = new LruMap<number, { chatId: number; topic: string }>(10_000);

// ─── Register ────────────────────────────────────────────────────────────────

export function registerAnonymous(bot: Telegraf<Context>) {

  // 群内点击「匿名大字报」
  bot.action('start_anonymous', async (ctx) => {
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

      try { await ctx.editMessageReplyMarkup(undefined); } catch {}

      await ctx.telegram.sendMessage(
        chatId,
        t.anonymous.chooseTopic,
        {
          parse_mode: 'HTML',
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback(t.anonymous.topicConfess, `anon_topic_${chatId}_confess`),
              Markup.button.callback(t.anonymous.topicRoast, `anon_topic_${chatId}_roast`),
            ],
            [
              Markup.button.callback(t.anonymous.topicSecret, `anon_topic_${chatId}_secret`),
              Markup.button.callback(t.anonymous.topicCompliment, `anon_topic_${chatId}_compliment`),
            ],
            [
              Markup.button.callback(t.anonymous.topicRant, `anon_topic_${chatId}_rant`),
              Markup.button.callback(t.anonymous.topicDream, `anon_topic_${chatId}_dream`),
            ],
          ]).reply_markup,
        },
      );
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'start_anonymous error');
    }
  });

  // 选预设话题
  bot.action(/^anon_topic_(-?\d+)_(confess|roast|secret)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatId = Number(ctx.match[1]);
      const key = ctx.match[2];
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);

      const topicMap: Record<string, string> = {
        confess: t.anonymous.topicConfess,
        roast: t.anonymous.topicRoast,
        secret: t.anonymous.topicSecret,
      };

      try { await ctx.editMessageReplyMarkup(undefined); } catch {}
      await launchAnonymousWall(bot, chatId, topicMap[key] || key);
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'anon_topic error');
    }
  });

  // 更多预设话题
  bot.action(/^anon_topic_(-?\d+)_(compliment|rant|dream)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const chatId = Number(ctx.match[1]);
      const key = ctx.match[2];
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);

      const topicMap: Record<string, string> = {
        compliment: t.anonymous.topicCompliment,
        rant: t.anonymous.topicRant,
        dream: t.anonymous.topicDream,
      };

      try { await ctx.editMessageReplyMarkup(undefined); } catch {}
      await launchAnonymousWall(bot, chatId, topicMap[key] || key);
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'anon_topic error');
    }
  });

  // Note: anon_ deep link handling is done via handleAnonStart() called from index.ts

  // 私聊文本 → 匿名转发到群
  bot.on('text', async (ctx, next) => {
    if (ctx.chat?.type !== 'private') return next();
    const userId = ctx.from?.id;
    if (!userId) return next();

    const session = anonSessions.get(userId);
    if (!session) return next();

    const text = 'text' in ctx.message ? ctx.message.text : '';
    if (!text) return next();

    try {
      const lang = await getChatLanguage(session.chatId);
      const t = getTexts(lang);

      // Check wall is still active
      const state = await getOrCreateChatState(session.chatId);
      if (state.currentGame !== 'anonymous' || state.phase !== 'in_game') {
        await ctx.reply(t.anonymous.notActive);
        anonSessions.delete(userId);
        return;
      }

      await bot.telegram.sendMessage(
        session.chatId,
        t.anonymous.forwarded(session.topic, text),
        { parse_mode: 'HTML' },
      );
      trackGroupMessage();
      await ctx.reply(t.anonymous.sent);
    } catch (err) {
      logger.error({ err: errMsg(err) }, 'anon forward error');
    }
  });

  // /quit — 结束匿名大字报
  bot.command('quit', async (ctx) => {
    if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) return;
    const chatId = ctx.chat.id;
    const state = await getOrCreateChatState(chatId);
    if (state.currentGame !== 'anonymous') return;

    const lang = await getChatLanguage(chatId);
    const t = getTexts(lang);
    await resetChatState(chatId);
    await ctx.reply(t.anonymous.ended);
  });
}

// ─── Launch wall with a topic ────────────────────────────────────────────────

/** Handle /start anon_<chatId> deep link — called from index.ts */
export async function handleAnonStart(ctx: Context, payload: string): Promise<boolean> {
  if (!payload.startsWith('anon_')) return false;

  try {
    const chatId = Number(payload.replace('anon_', ''));
    if (!Number.isFinite(chatId)) return false;

    const lang = await getChatLanguage(chatId);
    const t = getTexts(lang);
    const state = await getOrCreateChatState(chatId);

    if (state.currentGame !== 'anonymous' || state.phase !== 'in_game') {
      await ctx.reply(t.anonymous.notActive);
      return true;
    }

    const topic = (state.data?.['anonTopic'] as string) || '💬';
    const userId = ctx.from?.id;
    if (!userId) return true;

    anonSessions.set(userId, { chatId, topic });
    await ctx.reply(t.anonymous.privateIntro(topic), { parse_mode: 'HTML' });
    return true;
  } catch (err) {
    logger.error({ err: errMsg(err) }, 'anon start error');
    return true;
  }
}

async function launchAnonymousWall(bot: Telegraf<Context>, chatId: number, topic: string) {
  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  await setChatState(chatId, {
    currentGame: 'anonymous',
    phase: 'in_game',
    data: { anonTopic: topic },
  });

  const botInfo = await bot.telegram.getMe();
  const deepLink = `https://t.me/${botInfo.username}?start=anon_${chatId}`;

  const kb = Markup.inlineKeyboard([
    [Markup.button.url(t.anonymous.btnOpenDM, deepLink)],
  ]);
  await bot.telegram.sendMessage(
    chatId,
    t.anonymous.wallActive(topic),
    { parse_mode: 'HTML', reply_markup: kb.reply_markup },
  );
  trackGroupMessage();
}
