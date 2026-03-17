/**
 * Бункер (地堡生存) — 重度社交、辩论、投票
 * 复用 RoomManager 房间体系，私聊发身份卡，群内辩论与投票淘汰。
 */

import { Context, Markup, Telegraf } from 'telegraf';
import {
  getChatLanguage,
  setChatTimeout,
  clearChatTimeout,
  getOrCreateChatState,
  setChatState,
  resetChatState,
} from '../state';
import { getTexts } from '../i18n';
import { tryAcquireRoom, releaseRoom, getChatRoomUsage } from '../roomQuota';
import { withGrowthButtons } from '../growth';
import { formatText, getRandomItem } from '../utils/format';
import type { I18nTexts } from '../i18n/types';
import { EMOJI_POOL, activeVotingEmojis, releaseVotingEmojis, normalizeVoteText } from './votingEmojis';

// ========== 词库（i18n 未提供时 fallback）==========
const FALLBACK_PROFESSIONS = ['Biologist', 'Comedian', 'Doctor', 'Engineer', 'Teacher'];
const FALLBACK_HEALTH = ['Asthma', 'Very healthy', 'Diabetes', 'No conditions'];
const FALLBACK_INVENTORY = ['Guitar', 'First aid kit', 'Flashlight', 'Map'];
const FALLBACK_PHOBIAS = ['Claustrophobia', 'Fear of water', 'Fear of darkness', 'None'];
const FALLBACK_DISASTERS = ['Meteor impact: bunker holds 4 people.', 'Nuclear fallout: bunker holds 5 people.'];
const AGE_AND_GENDER = [
  '18 y.o. female', '25 y.o. male', '30 y.o. female', '45 y.o. male', '70 y.o. male',
];
const SPECIAL_ACTIONS = [
  'Peek one player\'s card', 'Swap one trait', 'Cancel one vote', 'None',
];

const TRAIT_KEYS = ['profession', 'ageAndGender', 'health', 'phobia', 'inventory', 'specialAction'] as const;
type TraitKey = typeof TRAIT_KEYS[number];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ========== 数据结构 ==========

export interface BunkerTraits {
  profession: string;
  ageAndGender: string;
  health: string;
  phobia: string;
  inventory: string;
  specialAction: string;
}

export interface BunkerPlayer {
  id: number;
  name: string;
  username?: string;
  isAlive: boolean;
  traits: BunkerTraits;
}

type BunkerPhase = 'LOBBY' | 'DEAL_CARDS' | 'DEBATE_PHASE' | 'VOTING_PHASE' | 'GAME_OVER';

interface BunkerRoom {
  chatId: number;
  roomId: number;
  phase: BunkerPhase;
  players: BunkerPlayer[];
  bunkerCapacity: number;
  disasterText: string;
  debateRound: number; // 0..5, which trait to reveal
  votes: Record<number, number>; // voterId -> targetId
  active: boolean;
  /** 本场游戏固定：玩家 id → 代表表情，首次投票时随机分配，直到游戏结束才释放 */
  emojiByPlayerId?: Record<number, string>;
  /** 本房间占用的 Emoji 列表，游戏结束时释放 */
  votingEmojis?: string[];
}

const MIN_PLAYERS = 6;
const MAX_PLAYERS = 12;
const LOBBY_COUNTDOWN_MS = 30_000;
const SPEAK_MS = 15_000;       // 每人发言 15s
const FREETALK_MS = 45_000;   // 45s 自由讨论
const VOTE_MS = 10_000;       // 投票 10s
const MAX_ROOMS_PER_CHAT = 20;

/** 当前处于投票阶段的 chatId → 该群显示的「结束游戏」按钮文案（用于文本匹配） */
const currentVotingEndGameByChat = new Map<number, string>();

/** 释放某房间占用的所有投票 Emoji，供其他房间使用 */
function releaseVotingEmojisForRoom(room: BunkerRoom): void {
  releaseVotingEmojis(room.votingEmojis);
  room.votingEmojis = undefined;
  room.emojiByPlayerId = undefined;
}

/** 辩论/投票环节的“提前结束”解析器。key: `${chatId}_${roomId}_${phase}` */
const pendingDebateResolvers = new Map<string, {
  resolve: (result?: { forceEnd?: boolean }) => void;
  currentUserId?: number;
  timerKey: string;
}>();

const roomsByChat = new Map<number, BunkerRoom[]>();

function getActiveRooms(chatId: number): BunkerRoom[] {
  return (roomsByChat.get(chatId) || []).filter((r) => r.active);
}

function createRoom(chatId: number): BunkerRoom | null {
  const active = getActiveRooms(chatId);
  if (active.length >= MAX_ROOMS_PER_CHAT) return null;
  const usedIds = new Set(active.map((r) => r.roomId));
  let nextId = 1;
  while (usedIds.has(nextId) && nextId <= MAX_ROOMS_PER_CHAT) {
    nextId += 1;
  }
  if (nextId > MAX_ROOMS_PER_CHAT) return null;
  const room: BunkerRoom = {
    chatId,
    roomId: nextId,
    phase: 'LOBBY',
    players: [],
    bunkerCapacity: 4,
    disasterText: '',
    debateRound: 0,
    votes: {},
    active: true,
  };
  const list = roomsByChat.get(chatId) || [];
  roomsByChat.set(chatId, [...list, room]);
  return room;
}

function getRoom(chatId: number, roomId: number): BunkerRoom | undefined {
  return (roomsByChat.get(chatId) || []).find((r) => r.roomId === roomId && r.active);
}

function endRoom(room: BunkerRoom) {
  room.active = false;
}

function generateTraits(t: I18nTexts): BunkerTraits {
  return {
    profession: (getRandomItem(t.bunker?.professions) as string) || pick(FALLBACK_PROFESSIONS),
    ageAndGender: pick(AGE_AND_GENDER),
    health: (getRandomItem(t.bunker?.health) as string) || pick(FALLBACK_HEALTH),
    phobia: (getRandomItem(t.bunker?.phobias) as string) || pick(FALLBACK_PHOBIAS),
    inventory: (getRandomItem(t.bunker?.inventory) as string) || pick(FALLBACK_INVENTORY),
    specialAction: pick(SPECIAL_ACTIONS),
  };
}

function formatTraitsForReveal(traits: BunkerTraits): string {
  return [traits.profession, traits.ageAndGender, traits.health, traits.phobia, traits.inventory, traits.specialAction].join(', ');
}

// ========== 群发：带 🎪 N号房间 前缀 ==========
async function sendToRoom(
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

// ========== 流程 ==========

async function startBunkerGame(bot: Telegraf<Context>, room: BunkerRoom) {
  const { chatId, players } = room;
  const t = getTexts(await getChatLanguage(chatId));

  if (players.length < MIN_PLAYERS) {
    await sendToRoom(bot, chatId, room.roomId, t.bunker?.notEnoughToStart ?? `Need at least ${MIN_PLAYERS} players. Game cancelled.`, { parse_mode: 'HTML' });
    await releaseRoom(chatId, 'bunker');
    endRoom(room);
    return;
  }

  room.phase = 'DEAL_CARDS';
  room.disasterText = (getRandomItem(t.bunker?.disasters) as string) || pick(FALLBACK_DISASTERS);
  const match = room.disasterText.match(/\d+/);
  room.bunkerCapacity = match ? parseInt(match[0], 10) : 4;

  for (const p of room.players) {
    p.traits = generateTraits(t);
    p.isAlive = true;
    try {
      const cardText = formatText(t.bunker?.your_card, {
        profession: p.traits.profession,
        health: p.traits.health,
        inventory: p.traits.inventory,
        phobia: p.traits.phobia,
      });
      await bot.telegram.sendMessage(p.id, cardText || formatFallbackCard(p.traits), { parse_mode: 'HTML' });
    } catch {
      // user may have blocked bot
    }
  }

  const startMsg = formatText(t.bunker?.game_start, {
    disaster: room.disasterText,
    capacity: room.bunkerCapacity,
  });
  await sendToRoom(bot, chatId, room.roomId, startMsg || `☢️ ${room.disasterText}\n\n${t.bunker?.cardsSent ?? 'Cards sent in private.'}`, { parse_mode: 'HTML' });

  room.debateRound = 0;
  void runDebatePhase(bot, room);
}

function formatFallbackCard(traits: BunkerTraits): string {
  return `🎫 <b>YOUR DOSSIER</b>\nProfession: ${traits.profession}\nHealth: ${traits.health}\nInventory: ${traits.inventory}\nPhobia: ${traits.phobia}`;
}

function getAlive(room: BunkerRoom): BunkerPlayer[] {
  return room.players.filter((p) => p.isAlive);
}

/** 本轮辩论/投票的全局进度条（发言顺序），所有环节都拼在消息顶部 */
function buildOrderHeader(t: I18nTexts['bunker'], room: BunkerRoom, alive: BunkerPlayer[]): string {
  const orderLine = alive.map((p) => p.name).join(' > ');
  return t?.orderHeader?.(room.roomId, orderLine) ?? `🎪 【 📍 #${room.roomId}号房间 】\n发言顺序：\n📍 ${orderLine} > 45s自由讨论 > 投票`;
}

/** 可被按键提前 resolve 的等待。phase: speaking | freetalk | vote */
function waitWithSkip(
  chatId: number,
  roomId: number,
  phase: 'speaking' | 'freetalk' | 'vote',
  ms: number,
  currentUserId?: number,
): Promise<{ forceEnd?: boolean }> {
  const mapKey = `${chatId}_${roomId}_${phase}`;
  const timerKey = `bunker_${roomId}_${phase}` as import('../state').TimerKey;
  return new Promise((resolve) => {
    setChatTimeout(chatId, timerKey, () => {
      pendingDebateResolvers.delete(mapKey);
      resolve({});
    }, ms);
    pendingDebateResolvers.set(mapKey, {
      resolve: (result) => {
        clearChatTimeout(chatId, timerKey);
        pendingDebateResolvers.delete(mapKey);
        resolve(result ?? {});
      },
      currentUserId,
      timerKey,
    });
  });
}

async function runDebatePhase(bot: Telegraf<Context>, room: BunkerRoom) {
  const chatId = room.chatId;
  const t = getTexts(await getChatLanguage(chatId));
  const alive = getAlive(room);
  if (alive.length <= room.bunkerCapacity) {
    room.phase = 'GAME_OVER';
    await endBunkerGame(bot, room);
    return;
  }

  room.phase = 'DEBATE_PHASE';
  const orderHeader = buildOrderHeader(t.bunker, room, alive);

  // 阶段 A：个人发言轮次，每人 15s
  for (let i = 0; i < alive.length; i++) {
    const current = alive[i];
    const body = t.bunker?.currentSpeaker?.(current.name) ?? `当前发言：📍 ${current.name}\n❗️非本人不要点击按键`;
    const text = `${orderHeader}\n\n${body}`;
    const btnEndSpeak = t.bunker?.btnEndSpeak ?? '结束发言';
    await sendToRoom(bot, chatId, room.roomId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[Markup.button.callback(btnEndSpeak, `bunker_skip_turn_${chatId}_${room.roomId}`)]],
      },
    });
    await waitWithSkip(chatId, room.roomId, 'speaking', SPEAK_MS, current.id);
    // 若房间已被强制结束则不再继续
    const stillRoom = getRoom(chatId, room.roomId);
    if (!stillRoom || !stillRoom.active || stillRoom.phase === 'GAME_OVER') return;
  }

  // 阶段 B：45s 自由讨论
  const freetalkBody = t.bunker?.freetalkTitle ?? '🗣 45秒自由讨论！';
  const btnEndRound = t.bunker?.btnEndRound ?? '结束回合';
  await sendToRoom(bot, chatId, room.roomId, `${orderHeader}\n\n${freetalkBody}`, {
    reply_markup: {
      inline_keyboard: [[Markup.button.callback(btnEndRound, `bunker_skip_freetalk_${chatId}_${room.roomId}`)]],
    },
  });
  await waitWithSkip(chatId, room.roomId, 'freetalk', FREETALK_MS);
  const stillRoom2 = getRoom(chatId, room.roomId);
  if (!stillRoom2 || !stillRoom2.active || stillRoom2.phase === 'GAME_OVER') return;

  void runVotingPhase(bot, room);
}

async function runVotingPhase(bot: Telegraf<Context>, room: BunkerRoom) {
  const chatId = room.chatId;
  room.phase = 'VOTING_PHASE';
  room.votes = {};
  const alive = getAlive(room);
  const t = getTexts(await getChatLanguage(chatId));

  if (alive.length <= room.bunkerCapacity) {
    room.phase = 'GAME_OVER';
    await endBunkerGame(bot, room);
    return;
  }

  const orderHeader = buildOrderHeader(t.bunker, room, alive);
  const voteBody = t.bunker?.votePromptTimer?.(10) ?? '🗳 请点击下方专属表情按键或直接发送代号投票（10秒倒计时）：';
  const btnEndGame = t.bunker?.btnEndGame ?? '🛑 结束游戏';
  const eliminateLabel = t.bunker?.voteEliminateLabel ?? '淘汰';

  if (!room.emojiByPlayerId) {
    room.emojiByPlayerId = {};
    room.votingEmojis = [];
    const shuffledAlive = shuffle([...alive]);
    for (const p of shuffledAlive) {
      const availableEmojis = EMOJI_POOL.filter((e) => !activeVotingEmojis.has(normalizeVoteText(e)));
      if (availableEmojis.length === 0) {
        await sendToRoom(bot, chatId, room.roomId, orderHeader + '\n\n' + (t.bunker?.emojiPoolExhausted ?? 'Emoji 池已耗尽，本局结束。'), {});
        room.phase = 'GAME_OVER';
        endRoom(room);
        await releaseRoom(chatId, 'bunker');
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableEmojis.length);
      const selectedEmoji = availableEmojis[randomIndex];
      const key = normalizeVoteText(selectedEmoji);
      room.emojiByPlayerId[p.id] = key;
      room.votingEmojis!.push(key);
      activeVotingEmojis.set(key, { game: 'bunker', chatId, roomId: room.roomId, targetId: p.id, targetName: p.name });
    }
  }

  let panelLines = '';
  const buttons: string[] = [];
  for (const p of alive) {
    const emoji = room.emojiByPlayerId![p.id];
    if (!emoji) continue;
    panelLines += `${emoji} - ${eliminateLabel} ${p.name}\n`;
    buttons.push(emoji);
  }

  currentVotingEndGameByChat.set(chatId, btnEndGame);
  // 将表情按键按 6 个一行分组，便于在最多 12 名玩家时保持整齐排版
  const rows: string[][] = [];
  for (let i = 0; i < buttons.length; i += 6) {
    rows.push(buttons.slice(i, i + 6));
  }
  rows.push([btnEndGame]);
  const replyKeyboard = Markup.keyboard(rows).oneTime().resize();
  await sendToRoom(bot, chatId, room.roomId, `${orderHeader}\n\n${voteBody}\n\n${panelLines.trim()}`, {
    reply_markup: replyKeyboard.reply_markup,
  });

  const result = await waitWithSkip(chatId, room.roomId, 'vote', VOTE_MS);
  currentVotingEndGameByChat.delete(chatId);
  if (result.forceEnd) {
    releaseVotingEmojisForRoom(room);
    room.phase = 'GAME_OVER';
    endRoom(room);
    await releaseRoom(chatId, 'bunker');
    await setChatState(chatId, { currentGame: null, phase: 'idle', data: {} });
    const endMsg = t.bunker?.gameForceEnded ?? t.bunker?.game_over ?? '游戏已强制结束。';
    await sendToRoom(bot, chatId, room.roomId, endMsg, { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } });
    return;
  }

  void finishVoting(bot, room);
}

async function finishVoting(bot: Telegraf<Context>, room: BunkerRoom) {
  const chatId = room.chatId;
  const alive = getAlive(room);
  const t = getTexts(await getChatLanguage(chatId));

  currentVotingEndGameByChat.delete(chatId);
  // 不在结算时释放 emoji，本场表情固定直到游戏结束，由 endBunkerGame / 强制结束时统一释放

  // 谁投了谁：targetId -> voterIds[]
  const votesByTarget: Record<number, number[]> = {};
  for (const [voterIdStr, targetId] of Object.entries(room.votes)) {
    const vid = Number(voterIdStr);
    if (!votesByTarget[targetId]) votesByTarget[targetId] = [];
    votesByTarget[targetId].push(vid);
  }
  // 仅得票 > 0 的玩家，按票数降序
  const entries = (Object.entries(votesByTarget) as [string, number[]][])
    .map(([tid, arr]) => ({ targetId: Number(tid), count: arr.length, voterIds: arr }))
    .filter((v) => v.count > 0)
    .sort((a, b) => b.count - a.count);

  const orderHeader = t.bunker?.tallyHeader?.(room.roomId) ?? `🎪 【 📍 #${room.roomId}号房间 】`;
  const tallyTitle = t.bunker?.tallyTitle ?? '🗳 投票结算：';
  const tallyLineFn = t.bunker?.tallyLine ?? ((name: string, count: number, voters: string) => `${name}  ${count}票 <<< ${voters}`);
  const noVotes = t.bunker?.noVotesInTally ?? '（无人投票）';
  const tallyLines: string[] = [];
  for (const e of entries) {
    const target = room.players.find((p) => p.id === e.targetId);
    const voterNames = e.voterIds.map((id) => room.players.find((p) => p.id === id)?.name ?? String(id)).join(', ');
    tallyLines.push(tallyLineFn(target?.name ?? String(e.targetId), e.count, voterNames));
  }
  const tallyBody = tallyLines.length > 0 ? `${tallyTitle}\n${tallyLines.join('\n')}` : `${tallyTitle}\n${noVotes}`;
  await sendToRoom(bot, chatId, room.roomId, `${orderHeader}\n${tallyBody}`, {
    reply_markup: { remove_keyboard: true },
  });

  let eliminatedId: number | null = null;
  if (entries.length > 0) {
    const top = entries[0];
    const tied = entries.filter((e) => e.count === top.count);
    const toEliminate = tied.length > 1 ? pick(tied) : top;
    eliminatedId = toEliminate.targetId;
  }

  if (eliminatedId != null) {
    const p = room.players.find((x) => x.id === eliminatedId);
    if (p) {
      p.isAlive = false;
      const kickedMsg = formatText(t.bunker?.player_kicked, {
        name: p.name,
        traits: formatTraitsForReveal(p.traits),
      });
      await sendToRoom(bot, chatId, room.roomId, kickedMsg || (t.bunker?.eliminated?.(p.name) ?? `💀 ${p.name} 被淘汰！`), { parse_mode: 'HTML' });
    }
  }

  room.debateRound += 1;
  const stillAlive = getAlive(room);
  if (stillAlive.length <= room.bunkerCapacity) {
    room.phase = 'GAME_OVER';
    await endBunkerGame(bot, room);
    return;
  }
  void runDebatePhase(bot, room);
}

async function endBunkerGame(bot: Telegraf<Context>, room: BunkerRoom) {
  const chatId = room.chatId;
  const t = getTexts(await getChatLanguage(chatId));
  releaseVotingEmojisForRoom(room);
  const survivors = getAlive(room);
  const names = survivors.map((p) => p.name).join(', ');
  const gameOverMsg = formatText(t.bunker?.game_over, { winners: names }) || (t.bunker?.survivorsWin?.(names) ?? `🏆 Survivors: ${names}`);
  await sendToRoom(bot, chatId, room.roomId, gameOverMsg, {
    parse_mode: 'HTML',
    reply_markup: withGrowthButtons(t).reply_markup,
  });
  await releaseRoom(chatId, 'bunker');
  endRoom(room);
  await setChatState(chatId, { currentGame: null, phase: 'idle', data: {} });
}

// ========== 注册 ==========

export function registerBunker(bot: Telegraf<Context>) {
  bot.action('start_bunker', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        const lang = await getChatLanguage(ctx.chat?.id ?? 0);
        await ctx.reply(getTexts(lang).common.onlyGroups);
        return;
      }
      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      if (!(await tryAcquireRoom(chatId, 'bunker'))) {
        const usage = await getChatRoomUsage(chatId);
        await ctx.reply(t.common.roomFull(usage.used, usage.max));
        return;
      }
      const room = createRoom(chatId);
      if (!room) {
        const usage = await getChatRoomUsage(chatId);
        await ctx.reply(t.common.roomFull(usage.used, usage.max));
        await releaseRoom(chatId, 'bunker');
        return;
      }
      await setChatState(chatId, { currentGame: 'bunker', phase: 'waiting_players', data: { bunkerRoomId: room.roomId } });
      try {
        await ctx.editMessageReplyMarkup(undefined);
      } catch {}

      const botUsername = ctx.botInfo?.username;
      if (!botUsername) {
        await ctx.reply(t.errors.generic);
        await releaseRoom(chatId, 'bunker');
        endRoom(room);
        return;
      }
      const link = `https://t.me/${botUsername}?start=bunker_${chatId}_${room.roomId}`;
      await sendToRoom(bot, chatId, room.roomId, t.bunker?.joinPrompt?.(link, MIN_PLAYERS, MAX_PLAYERS) ?? `Bunker: Join via link (DM). ${MIN_PLAYERS}-${MAX_PLAYERS} players. Start in 30s.\n${link}`, { parse_mode: 'HTML' });
      setChatTimeout(chatId, `bunker_${room.roomId}_start`, () => {
        startBunkerGame(bot, room).catch((err) => console.error('Bunker start error', err));
      }, LOBBY_COUNTDOWN_MS);
    } catch (err) {
      console.error('Bunker entry error', err);
    }
  });

  bot.start(async (ctx) => {
    const payload = ctx.startPayload;
    if (!payload?.startsWith('bunker_')) return;
    const parts = payload.split('_');
    const chatId = Number(parts[1]);
    const roomId = Number(parts[2]);
    const lang = await getChatLanguage(chatId);
    const t = getTexts(lang);
    if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) {
      await ctx.reply(t.anonymous.invalidLink);
      return;
    }
    const room = getRoom(chatId, roomId);
    if (!room) {
      await ctx.reply(t.common.roomClosedOrNotFound);
      return;
    }
    if (room.phase !== 'LOBBY') {
      await ctx.reply(t.common.linkExpiredGameStarted);
      return;
    }
    const from = ctx.from;
    if (!from) {
      await ctx.reply(t.errors.generic);
      return;
    }
    if (room.players.some((p) => p.id === from.id)) {
      await ctx.reply(t.bunker?.alreadyJoined ?? 'You already joined.');
      return;
    }
    if (room.players.length >= MAX_PLAYERS) {
      await ctx.reply(t.bunker?.linkExpiredRoomFull?.(MAX_PLAYERS) ?? t.bunker?.roomFull ?? 'Room is full.');
      return;
    }
    const name = from.username ? `@${from.username}` : from.first_name || 'Player';
    room.players.push({
      id: from.id,
      name: from.username ? `@${from.username}` : from.first_name || 'Player',
      username: from.username,
      isAlive: true,
      traits: { profession: '', ageAndGender: '', health: '', phobia: '', inventory: '', specialAction: '' },
    });
    await ctx.reply(t.bunker?.joinSuccess ?? 'You joined the Bunker. Wait for the game to start in the group.');
    const names = room.players.map((p) => p.name).join(', ');
    await bot.telegram.sendMessage(chatId, t.bunker?.currentPlayers?.(room.roomId, room.players.length, names) ?? `${getTexts(await getChatLanguage(chatId)).common.roomLabel(room.roomId)}\nPlayers: ${room.players.length} — ${names}`, { parse_mode: 'HTML' });
  });

  bot.action(/^bunker_skip_turn_(\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) return;
      const t = getTexts(await getChatLanguage(chatId));
      const mapKey = `${chatId}_${roomId}_speaking`;
      const pending = pendingDebateResolvers.get(mapKey);
      if (!pending) {
        await ctx.answerCbQuery(t.bunker?.alreadyEnded ?? '已结束', { show_alert: false });
        return;
      }
      const userId = ctx.from?.id;
      if (userId !== pending.currentUserId) {
        await ctx.answerCbQuery(t.bunker?.notYourTurn ?? '❗️非本人不可点击', { show_alert: true });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve();
    } catch (err) {
      console.error('Bunker skip_turn error', err);
    }
  });

  bot.action(/^bunker_skip_freetalk_(\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) return;
      const t = getTexts(await getChatLanguage(chatId));
      const mapKey = `${chatId}_${roomId}_freetalk`;
      const pending = pendingDebateResolvers.get(mapKey);
      if (!pending) {
        await ctx.answerCbQuery(t.bunker?.alreadyEnded ?? '已结束', { show_alert: false });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve();
    } catch (err) {
      console.error('Bunker skip_freetalk error', err);
    }
  });

  bot.action(/^bunker_force_end_(-?\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) return;
      const t = getTexts(await getChatLanguage(chatId));
      const mapKey = `${chatId}_${roomId}_vote`;
      const pending = pendingDebateResolvers.get(mapKey);
      if (!pending) {
        await ctx.answerCbQuery(t.bunker?.alreadyEnded ?? '已结束', { show_alert: false });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve({ forceEnd: true });
    } catch (err) {
      console.error('Bunker force_end error', err);
    }
  });

  bot.on('text', async (ctx, next) => {
    const text = ctx.message?.text?.trim();
    if (!text) return next();
    const chatId = ctx.chat?.id;
    if (typeof chatId !== 'number' || (ctx.chat?.type !== 'group' && ctx.chat?.type !== 'supergroup')) return next();

    const t = getTexts(await getChatLanguage(chatId));
    const btnEndGame = t.bunker?.btnEndGame ?? '🛑 结束游戏';

    if (text === btnEndGame || text === currentVotingEndGameByChat.get(chatId)) {
      const activeRooms = getActiveRooms(chatId);
      const votingRoom = activeRooms.find((r) => r.phase === 'VOTING_PHASE');
      if (votingRoom) {
        const mapKey = `${chatId}_${votingRoom.roomId}_vote`;
        const pending = pendingDebateResolvers.get(mapKey);
        if (pending) {
          pending.resolve({ forceEnd: true });
          return;
        }
      }
      return next();
    }

    const voteKey = normalizeVoteText(text);
    if (activeVotingEmojis.has(voteKey)) {
      const info = activeVotingEmojis.get(voteKey)!;
      if (info.game !== 'bunker') return next();
      const room = getRoom(info.chatId, info.roomId);
      if (!room || room.phase !== 'VOTING_PHASE' || room.chatId !== chatId) return next();
      const voterId = ctx.from?.id;
      if (!voterId) return next();
      const voter = room.players.find((p) => p.id === voterId && p.isAlive);
      if (!voter) return next();
      room.votes[voterId] = info.targetId;
      const voteConfirm = t.bunker?.voteUpdated ?? ((emoji: string, name: string) => `✅ 投票更新！你已成功把票投给 ${emoji} ${name}`);
      await ctx.reply(voteConfirm(text, info.targetName), {
        reply_parameters: { message_id: ctx.message.message_id },
      });
      return;
    }

    return next();
  });
}
