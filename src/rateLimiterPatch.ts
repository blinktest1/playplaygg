/**
 * Telegram API 限流补丁
 *
 * 在 bot 启动前调用 patchBotWithRateLimiter(bot)，
 * 之后所有 bot.telegram.sendMessage / editMessageText / etc.
 * 以及 ctx.reply 都会自动走限流队列。
 *
 * 零侵入：不改变任何业务代码的调用方式和返回类型。
 */

import { Context, Telegraf, Telegram } from 'telegraf';
import { enqueue } from './rateLimiter';

/**
 * 需要限流的 Telegram 方法名（都是会消耗发送配额的）。
 *
 * 以下方法不需要限流，故不在此列：
 *   - answerCallbackQuery: 回复 callback query，不消耗消息发送配额
 *   - answerInlineQuery: 回复 inline query，走独立配额（~30/s per bot）
 *   - getChat / getChatMember / getMe 等只读方法
 */
const THROTTLED_METHODS: ReadonlySet<string> = new Set([
  'sendMessage',
  'sendPhoto',
  'sendDocument',
  'sendVideo',
  'sendAnimation',
  'sendAudio',
  'sendVoice',
  'sendVideoNote',
  'sendSticker',
  'sendLocation',
  'sendVenue',
  'sendContact',
  'sendPoll',
  'sendDice',
  'forwardMessage',
  'copyMessage',
  'editMessageText',
  'editMessageCaption',
  'editMessageMedia',
  'editMessageReplyMarkup',
  'pinChatMessage',
  'unpinChatMessage',
  'deleteMessage',
]);

/**
 * 给 bot.telegram 打补丁，让所有发送类方法走限流队列。
 * 必须在 bot.launch() / bot.webhookCallback() 之前调用。
 */
export function patchBotWithRateLimiter(bot: Telegraf<Context>): void {
  const telegram = bot.telegram as unknown as Record<string, (...args: unknown[]) => unknown>;

  for (const method of THROTTLED_METHODS) {
    const original = telegram[method];
    if (typeof original !== 'function') continue;

    telegram[method] = function (this: Telegram, ...args: unknown[]): unknown {
      // 第一个参数通常是 chatId（sendMessage, editMessageText 等）
      // answerCallbackQuery 的第一个参数是 callback_query_id（string）
      const chatId = args[0];
      const chatKey = typeof chatId === 'number' || typeof chatId === 'string'
        ? chatId
        : 0; // fallback

      return enqueue(chatKey, () => (original as Function).apply(this, args) as Promise<unknown>);
    };
  }
}
