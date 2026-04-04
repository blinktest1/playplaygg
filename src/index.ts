import http from 'node:http';
import { Context, Markup, Telegraf } from 'telegraf';
import { config as appConfig } from './config';
import { getTexts } from './i18n';
import { connectRedis, closeRedis } from './state/redisClient';
import { getPrivateStartMsg } from './i18n/privateStartMsg';
import { getWelcomePinnedMsg, resolveLangFromTelegram } from './i18n/welcomePinned';
import {
  clearAllStates,
  getChatLanguage,
  setChatLanguage,
  getUserLanguage,
  setUserLanguage,
  type LanguageCode,
} from './state';
import { registerUndercover } from './games/undercover';
import { registerTruthOrDare } from './games/truthordare';
import { seedAllLanguages } from './games/undercover/wordStore';
import { logger, errMsg } from './logger';
import { patchBotWithRateLimiter } from './rateLimiterPatch';
import { flushQueue } from './rateLimiter';
import { trackUser, trackGroup, trackGroupMessage, getStats } from './stats';

// dotenv is loaded by ./config on import

const BOT_TOKEN = process.env.BOT_TOKEN || appConfig.BOT_TOKEN;

if (!BOT_TOKEN) {
  logger.error({}, 'BOT_TOKEN is missing');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
patchBotWithRateLimiter(bot);
const MENU_CB_PREFIX = 'v2_';

type SupportedLanguageOption = {
  code: LanguageCode;
  flag: string;
  label: string;
};

const LANGUAGE_OPTIONS: SupportedLanguageOption[] = [
  { code: 'ru', flag: 'RU', label: 'Russkii' },
  { code: 'en', flag: 'EN', label: 'English' },
  { code: 'zh', flag: 'ZH', label: '中文' },
];

function getMainMenuKeyboard(t: ReturnType<typeof getTexts>) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.mainMenu.btnLanguage, `${MENU_CB_PREFIX}open_language_menu`)],
    [Markup.button.callback(t.mainMenu.btnUndercover, `${MENU_CB_PREFIX}intro_undercover`)],
    [Markup.button.callback(t.mainMenu.btnTruthOrDare ?? '🎯 真心话大冒险', 'start_tod')],
    [Markup.button.callback(t.mainMenu.btnCancel, `${MENU_CB_PREFIX}cancel_main_menu`)],
  ]);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

async function showMainMenu(ctx: Context, opts?: { edit?: boolean }) {
  const chatId = ctx.chat?.id;
  const lang = typeof chatId === 'number' ? await getChatLanguage(chatId) : 'ru';
  const t = getTexts(lang);

  if (opts?.edit && 'callbackQuery' in ctx && ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(t.mainMenu.welcome, getMainMenuKeyboard(t));
      return;
    } catch {
      // fall through and send a fresh message
    }
  }

  await ctx.reply(t.mainMenu.welcome, getMainMenuKeyboard(t));
  if (ctx.chat && ctx.chat.type !== 'private') trackGroupMessage();
}

function runAfterCb(fn: () => Promise<void>): void {
  setImmediate(() => {
    fn().catch((err) => logger.error({ err: errMsg(err) }, 'runAfterCb'));
  });
}

async function showUndercoverIntro(ctx: Context) {
  const chatId = ctx.chat?.id;
  const lang = typeof chatId === 'number' ? await getChatLanguage(chatId) : 'ru';
  const t = getTexts(lang);
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(t.common.btnStartGame, 'start_undercover')],
    [Markup.button.callback(t.i18n.back, 'back_to_menu')],
  ]);

  if ('callbackQuery' in ctx && ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(t.intro.undercover, keyboard);
      return;
    } catch {
      // fall back to new reply
    }
  }

  await ctx.reply(t.intro.undercover, keyboard);
}

bot.catch(async (err, ctx) => {
  logger.error({ err: errMsg(err) }, 'Bot error');
  try {
    const chatId = ctx.chat?.id;
    const lang = typeof chatId === 'number' ? await getChatLanguage(chatId) : 'ru';
    await ctx.reply(getTexts(lang).errors.generic);
  } catch {
    // ignore secondary failure
  }
});

// Keep a silent legacy fallback to avoid command outages during rollout.
bot.command(['play', 'playgg'], async (ctx, next) => {
  const chat = ctx.chat;
  if (!chat) return next();

  if (chat.type === 'group' || chat.type === 'supergroup') {
    await showMainMenu(ctx);
    return;
  }

  if (chat.type === 'private') {
    const userId = ctx.from?.id;
    const userLang = userId != null ? await getUserLanguage(userId) : undefined;
    const lang: LanguageCode = userLang ?? resolveLangFromTelegram(ctx.from?.language_code);
    const t = getTexts(lang);
    const botUsername = ctx.botInfo?.username ?? 'Blink_AIgames_bot';
    const addToGroupUrl = `https://t.me/${botUsername}?startgroup=true`;
    const kb = Markup.inlineKeyboard([
      [Markup.button.url(t.mainMenu.btnAddToGroup, addToGroupUrl)],
    ]);
    await ctx.reply(t.mainMenu.privatePlayggHint, { parse_mode: 'HTML', reply_markup: kb.reply_markup });
    return;
  }

  return next();
});

bot.command('start', async (ctx, next) => {
  const chat = ctx.chat;
  if (!chat) return next();

  // Track every user who hits /start
  if (ctx.from?.id) trackUser(ctx.from.id);

  if (chat.type === 'group' || chat.type === 'supergroup') {
    const t = getTexts(await getChatLanguage(chat.id));
    await ctx.reply(t.mainMenu.groupUsePlaygg);
    return;
  }

  if (chat.type === 'private') {
    const msgText = 'text' in (ctx.message || {}) ? (ctx.message as { text?: string }).text : '';
    const payloadFromText =
      typeof msgText === 'string' && msgText.startsWith('/start')
        ? msgText.replace(/^\/start\s*/, '').trim()
        : '';
    const payload = ((ctx as any).startPayload as string | undefined) || payloadFromText;

    if (payload && payload.length > 0) {
      return next();
    }

    const userId = ctx.from?.id;
    const userLang = userId != null ? await getUserLanguage(userId) : undefined;
    const lang: LanguageCode = userLang ?? resolveLangFromTelegram(ctx.from?.language_code);
    const t = getTexts(lang);
    const botUsername = ctx.botInfo?.username ?? 'Blink_AIgames_bot';
    const addToGroupUrl = `https://t.me/${botUsername}?startgroup=true`;
    const kb = Markup.inlineKeyboard([
      [Markup.button.url(t.mainMenu.btnAddToGroup, addToGroupUrl)],
      [Markup.button.callback(t.mainMenu.btnLanguage, `${MENU_CB_PREFIX}open_language_menu`)],
    ]);
    await ctx.reply(getPrivateStartMsg(lang), { parse_mode: 'HTML', reply_markup: kb.reply_markup });
    return;
  }

  return next();
});

bot.on('text', async (ctx, next) => {
  try {
    const message = ctx.message;
    if (!('text' in message)) return next();

    const chatType = ctx.chat?.type;
    const text = message.text || '';

    const isReplyToBot =
      'reply_to_message' in message &&
      message.reply_to_message?.from?.is_bot &&
      message.reply_to_message.from.id === ctx.botInfo?.id;

    const isMentionBot =
      Array.isArray(message.entities) &&
      message.entities.some((e) => {
        if (e.type !== 'mention') return false;
        const mentionText = text.slice(e.offset, e.offset + e.length);
        const botUsername = ctx.botInfo?.username;
        return botUsername ? mentionText.toLowerCase().includes(botUsername.toLowerCase()) : false;
      });

    if (chatType === 'group' || chatType === 'supergroup') {
      if (isReplyToBot || isMentionBot) {
        await showMainMenu(ctx);
        return;
      }
    }

    return next();
  } catch (err) {
    logger.error({ err: errMsg(err) }, 'Text handler error');
    return next();
  }
});

bot.on('message', async (ctx, next) => {
  try {
    const msg = ctx.message as { new_chat_members?: { id: number }[]; from?: { language_code?: string } };
    const members = msg?.new_chat_members;
    if (!members || !Array.isArray(members)) return next();

    const botId = ctx.botInfo?.id;
    const botAdded = botId && members.some((m) => m.id === botId);
    if (!botAdded) return next();

    const chat = ctx.chat;
    if (!chat || (chat.type !== 'group' && chat.type !== 'supergroup')) return next();

    const groupLang = resolveLangFromTelegram(msg?.from?.language_code);
    await setChatLanguage(chat.id, groupLang);
    trackGroup(chat.id);

    const sentMsg = await ctx.reply(getWelcomePinnedMsg(groupLang), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
    ctx.telegram.pinChatMessage(chat.id, sentMsg.message_id).catch((e) =>
      logger.warn({ err: e?.message ?? String(e) }, 'Pin failed'),
    );
  } catch (err) {
    logger.error({ err: errMsg(err) }, 'Welcome message error');
  }
  return next();
});

registerUndercover(bot);
registerTruthOrDare(bot);

bot.action(`${MENU_CB_PREFIX}intro_undercover`, async (ctx) => {
  await ctx.answerCbQuery();
  runAfterCb(() => showUndercoverIntro(ctx));
});

bot.action('back_to_menu', async (ctx) => {
  await ctx.answerCbQuery();
  runAfterCb(() => showMainMenu(ctx, { edit: true }));
});

bot.action(`${MENU_CB_PREFIX}open_language_menu`, async (ctx) => {
  const chatId = ctx.chat?.id;
  if (typeof chatId !== 'number') return;
  try {
    await ctx.answerCbQuery();
    runAfterCb(async () => {
      const lang = await getChatLanguage(chatId);
      const t = getTexts(lang);
      const buttons = LANGUAGE_OPTIONS.map((opt) =>
        Markup.button.callback(`${opt.flag} ${opt.label}`, `set_lang_${opt.code}`),
      );
      const rows = chunk(buttons, 2);
      rows.push([Markup.button.callback(t.i18n.back, 'back_to_menu')]);
      const kb = Markup.inlineKeyboard(rows);
      try {
        await ctx.editMessageText(t.i18n.chooseLanguage, kb);
      } catch {
        await ctx.reply(t.i18n.chooseLanguage, kb);
      }
    });
  } catch (err) {
    logger.error({ err: errMsg(err) }, 'Open language menu error');
  }
});

bot.action(/^set_lang_(ru|en|zh)$/, async (ctx) => {
  const chatId = ctx.chat?.id;
  if (typeof chatId !== 'number') return;
  const lang = ctx.match[1] as LanguageCode;
  try {
    await ctx.answerCbQuery('OK');
    await setChatLanguage(chatId, lang);
    const userId = ctx.from?.id;
    if (userId != null) await setUserLanguage(userId, lang);
    runAfterCb(async () => {
      if (ctx.chat?.type === 'private') {
        const t = getTexts(lang);
        const kb = Markup.inlineKeyboard([
          [Markup.button.callback(t.mainMenu.btnLanguage, `${MENU_CB_PREFIX}open_language_menu`)],
        ]);
        try {
          await ctx.editMessageText(getPrivateStartMsg(lang), {
            parse_mode: 'HTML',
            reply_markup: kb.reply_markup,
          });
        } catch {
          await ctx.reply(getPrivateStartMsg(lang), {
            parse_mode: 'HTML',
            reply_markup: kb.reply_markup,
          });
        }
      } else {
        await showMainMenu(ctx, { edit: true });
      }
    });
  } catch (err) {
    logger.error({ err: errMsg(err) }, 'Set language error');
  }
});

bot.action(`${MENU_CB_PREFIX}cancel_main_menu`, async (ctx) => {
  const chatId = ctx.chat?.id;
  const lang = typeof chatId === 'number' ? await getChatLanguage(chatId) : 'ru';
  const t = getTexts(lang);
  try {
    await ctx.answerCbQuery(t.mainMenu.cancelAnswer);
    runAfterCb(async () => {
      try {
        await ctx.editMessageReplyMarkup(undefined);
      } catch {
        // ignore
      }
      if (typeof chatId === 'number') {
        await ctx.telegram.sendMessage(chatId, t.mainMenu.cancelAnswer);
      }
    });
  } catch (err) {
    logger.error({ err: errMsg(err) }, 'Cancel main menu error');
  }
});

bot.action(/^(intro_undercover|open_language_menu|cancel_main_menu)$/, async (ctx) => {
  const chatId = ctx.chat?.id;
  const lang = typeof chatId === 'number' ? await getChatLanguage(chatId) : 'ru';
  await ctx.answerCbQuery(getTexts(lang).mainMenu.usePlayggForLatestMenu);
});

const WEBHOOK_PATH = '/webhook';

async function start() {
  if (appConfig.useRedis) {
    const redis = await connectRedis();
    if (redis) {
      logger.info({}, 'Redis connected');
      await seedAllLanguages();
    }
  }

  if (appConfig.useWebhook) {
    const url = `${appConfig.WEBHOOK_URL.replace(/\/$/, '')}${WEBHOOK_PATH}`;
    const secretToken = appConfig.WEBHOOK_SECRET || undefined;
    await bot.telegram.setWebhook(url, { secret_token: secretToken });

    const webhookCb = bot.webhookCallback(WEBHOOK_PATH, { secretToken }) as (
      req: http.IncomingMessage,
      res: http.ServerResponse,
    ) => void;

    const server = http.createServer((req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
        return;
      }
      if (req.url === '/stats' && req.method === 'GET') {
        getStats().then((s) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(s));
        }).catch(() => {
          res.writeHead(500);
          res.end('error');
        });
        return;
      }
      if (req.url === '/health/version' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          version: process.env.npm_package_version || 'unknown',
          commit: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'unknown',
          commands: ['play', 'playgg'],
          truth_or_dare: true,
          mode: appConfig.useWebhook ? 'webhook' : 'polling',
        }));
        return;
      }
      if (req.url === WEBHOOK_PATH && req.method === 'POST') {
        webhookCb(req, res);
        return;
      }
      res.writeHead(404);
      res.end();
    });
    server.listen(appConfig.PORT, () => {
      logger.info({ port: appConfig.PORT, url }, 'Webhook started');
    });
    return;
  }

  await bot.launch();
  logger.info({}, 'Polling started');
}

start().catch((err) => {
  logger.error({ err: errMsg(err) }, 'Start failed');
  process.exit(1);
});

async function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Shutdown received, stopping bot...');
  bot.stop(signal);

  // Flush pending messages in rate limiter queue (up to 3s)
  await flushQueue(3000);

  // Give in-flight handlers up to 5 seconds to finish
  await new Promise((resolve) => setTimeout(resolve, 5_000));

  await clearAllStates();
  await closeRedis();
  logger.info({}, 'Shutdown cleanup done, exiting.');
  process.exit(0);
}

process.once('SIGINT', () => void gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => void gracefulShutdown('SIGTERM'));
