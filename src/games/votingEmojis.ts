/**
 * 地堡、谁是卧底等游戏共用的投票 Emoji 池与全局占用表。
 * 保证同一 Emoji 在同一时刻只会被一个房间使用；通过 game 字段区分不同游戏。
 */

/** 投票阶段专用 Emoji 池（海量标准 Unicode，Telegram 免费） */
export const EMOJI_POOL = [
  '😀', '😂', '🥰', '😎', '🤩', '🥳', '😡', '😱', '🥶', '😈', '👽', '👻', '💩', '🤖', '🎃',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵',
  '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',
  '🐢', '🐍', '🐙', '🦑', '🦐', '🐠', '🐟', '🐬', '🐳', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍',
  '🐘', '🦛', '🦏', '🐪', '🦒', '🦘', '🐐', '🦌', '🐕', '🐈', '🦚', '🦜', '🦢', '🦩', '🦝',
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
  '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨',
  '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🌮', '🌯',
  '⚽️', '🏀', '🏈', '⚾️', '🎾', '🏐', '🎱', '🏓', '🏸', '🥊', '🚗', '🚕', '🚙', '🚌', '🚎',
  '🏎', '🚓', '🚑', '🚒', '🚀', '🛸', '🚁', '🛶', '⛵️', '⌚️', '📱', '💻', '⌨️', '🖥', '🖨',
  '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞',
  '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛️',
  '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄',
  '📰', '🗞', '📑', '🔖', '🏷', '💰', '🪙', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💎',
  '💯', '💢', '💬', '👁‍🗨', '🗨', '🗯', '💭', '💤', '💮', '♨️', '💈', '🛑', '⏳', '📡',
];

export type VotingGameType = 'bunker' | 'undercover';

export interface ActiveVotingEmojiInfo {
  game: VotingGameType;
  chatId: number;
  roomId: number;
  targetId: number;
  targetName: string;
}

/** 当前正在使用的投票 Emoji → 房间与目标，全局唯一；game 用于文本处理时区分游戏 */
export const activeVotingEmojis = new Map<string, ActiveVotingEmojiInfo>();

/** 规范化投票文本：去掉 Unicode 变异选择符(U+FE0F)等，避免客户端发来的 emoji 与池内 key 不一致导致识别不到 */
export function normalizeVoteText(text: string): string {
  return text.replace(/\uFE0F/g, '');
}

/** 判断是否为当前任意房间的投票用表情（使用规范化后的文本查找） */
export function isVotingEmoji(text: string): boolean {
  return activeVotingEmojis.has(normalizeVoteText(text));
}

export function releaseVotingEmojis(emojis: string[] | undefined): void {
  if (!emojis) return;
  for (const e of emojis) activeVotingEmojis.delete(e);
}
