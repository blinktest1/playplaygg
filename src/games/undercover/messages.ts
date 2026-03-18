import { Context, Telegraf } from 'telegraf';
import { getChatLanguage } from '../../state';
import { getTexts } from '../../i18n';
import type { UndercoverPlayer, UndercoverRoom } from './types';

/** 生成返回群组的 Telegram 链接 */
export function buildGroupReturnLink(room: {
  chatId: number;
  username?: string;
  recruitmentMessageId?: number;
}): string {
  const msgId =
    room.recruitmentMessageId && room.recruitmentMessageId > 0
      ? room.recruitmentMessageId
      : 1;
  if (room.username) {
    return `https://t.me/${room.username}/${msgId}`;
  }
  const chatIdStr = String(room.chatId);
  if (chatIdStr.startsWith('-100')) {
    const cleanChatId = chatIdStr.substring(4);
    return `https://t.me/c/${cleanChatId}/${msgId}`;
  }
  const fallbackId = chatIdStr.replace(/^-/, '');
  return `https://t.me/c/${fallbackId}/999999999`;
}

/** 向房间所在群发消息，自动附带 🎪 N号房间 前缀 */
export async function sendRoomMessage(
  bot: Telegraf<Context>,
  chatId: number,
  roomId: number,
  text: string,
  extra?: Parameters<Telegraf<Context>['telegram']['sendMessage']>[2],
) {
  const t = getTexts(await getChatLanguage(chatId));
  const prefix = t.common.roomLabel(roomId);
  return bot.telegram.sendMessage(chatId, `${prefix}\n${text}`, extra);
}

/** 发言顺序：当前发言人加 📍 标记 */
export function formatSpeakingOrder(players: UndercoverPlayer[], currentIndex: number): string {
  return players
    .filter((p) => p.alive)
    .map((p, i) => (i === currentIndex ? `📍${p.name}` : p.name))
    .join(' > ');
}

/** 游戏结束报告 */
export function buildGameOverReport(
  room: UndercoverRoom,
  winnerLabel: string,
  subtitle: string,
  lang: import('../../state').LanguageCode,
): string {
  const t = getTexts(lang);
  const u = t.undercover;
  const formatName = (p: UndercoverPlayer) => (p.username ? `@${p.username}` : p.name);
  const spyList = room.state.players.filter((p) => p.role === 'SPY').map(formatName).join(' , ');
  const civList = room.state.players.filter((p) => p.role === 'CIVILIAN').map(formatName).join(' , ');
  const blankWord = u.reportBlankWord ?? '🚫 Blank';
  const none = u.reportNone ?? '(none)';
  const spyWordDisplay = room.state.undercoverWord || blankWord;
  const civWordDisplay = room.state.civilianWord || blankWord;
  const gameOverTitle = u.reportGameOver ?? '🚩 Game Over!';
  const spyLabel = u.reportSpyLabel ?? '🕵️‍♂️ Spies';
  const civLabel = u.reportCivLabel ?? '👨‍🌾 Civilians';
  const winLine = u.reportWinLine?.(winnerLabel) ?? `🏆 [ ${winnerLabel} ] Victory!`;

  return (
    `${gameOverTitle}\n\n` +
    `<b>${spyLabel} (${spyWordDisplay})：</b> ${spyList || none}\n` +
    `<b>${civLabel} (${civWordDisplay})：</b> ${civList || none}\n\n` +
    `<b>${winLine}</b>\n` +
    `<i>${subtitle}</i>`
  );
}
