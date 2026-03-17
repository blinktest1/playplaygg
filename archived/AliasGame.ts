/**
 * Alias (代号/猜词接力) — 队伍猜词，描述者私聊收词，公屏抢答，词根防作弊
 * 结合 RoomManager 与 bot.on('text') 监听，60 秒回合。
 */

import { Context, Telegraf } from 'telegraf';
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

const FALLBACK_WORDS = ['Astronaut', 'Piano', 'Umbrella', 'Dragon', 'Pizza', 'Telephone'];

function pickWord(t: ReturnType<typeof getTexts>): string {
  const w = getRandomItem(t.alias?.words);
  return (typeof w === 'string' ? w : '') || FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
}

/** 检测描述者是否在消息中泄露词根（子串） */
function containsWordRoot(message: string, word: string): boolean {
  const lower = message.trim().toLowerCase();
  const root = word.trim().toLowerCase();
  if (root.length < 2) return false;
  return lower.includes(root);
}

// ========== 数据结构 ==========

type TeamId = 'A' | 'B';

interface AliasPlayer {
  id: number;
  name: string;
  username?: string;
  team: TeamId;
}

interface AliasRoom {
  chatId: number;
  roomId: number;
  players: AliasPlayer[];
  scores: Record<TeamId, number>;
  currentTeam: TeamId;
  explainerIndex: number; // index in current team's players
  currentWord: string;
  explainerId: number | null;
  turnEndTimerKey: string;
  active: boolean;
  roundNumber: number;
}

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 12;
const TURN_SECONDS = 60;
const TURN_MS = TURN_SECONDS * 1000;
const LOBBY_MS = 25_000;
const MAX_ROOMS_PER_CHAT = 20;

const roomsByChat = new Map<number, AliasRoom[]>();
const nextRoomIdByChat = new Map<number, number>();

function getActiveRooms(chatId: number): AliasRoom[] {
  return (roomsByChat.get(chatId) || []).filter((r) => r.active);
}

function createRoom(chatId: number): AliasRoom | null {
  const active = getActiveRooms(chatId);
  if (active.length >= MAX_ROOMS_PER_CHAT) return null;
  const nextId = nextRoomIdByChat.get(chatId) ?? 1;
  nextRoomIdByChat.set(chatId, nextId + 1);
  const room: AliasRoom = {
    chatId,
    roomId: nextId,
    players: [],
    scores: { A: 0, B: 0 },
    currentTeam: 'A',
    explainerIndex: 0,
    currentWord: '',
    explainerId: null,
    turnEndTimerKey: '',
    active: true,
    roundNumber: 0,
  };
  const list = roomsByChat.get(chatId) || [];
  roomsByChat.set(chatId, [...list, room]);
  return room;
}

function getRoom(chatId: number, roomId: number): AliasRoom | undefined {
  return (roomsByChat.get(chatId) || []).find((r) => r.roomId === roomId && r.active);
}

async function getRoomForChat(chatId: number): Promise<AliasRoom | undefined> {
  const state = await getOrCreateChatState(chatId);
  const roomId = state.data['aliasRoomId'] as number | undefined;
  if (roomId == null) return undefined;
  return getRoom(chatId, roomId);
}

function endRoom(room: AliasRoom) {
  room.active = false;
}

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

function getTeamPlayers(room: AliasRoom, team: TeamId): AliasPlayer[] {
  return room.players.filter((p) => p.team === team);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ========== 回合逻辑 ==========

async function startTurn(bot: Telegraf<Context>, room: AliasRoom) {
  const chatId = room.chatId;
  const t = getTexts(await getChatLanguage(chatId));
  const teamPlayers = getTeamPlayers(room, room.currentTeam);
  if (teamPlayers.length === 0) {
    nextTurnOrEnd(bot, room);
    return;
  }
  const explainer = teamPlayers[room.explainerIndex % teamPlayers.length];
  room.explainerId = explainer.id;
  room.currentWord = pickWord(t);

  clearChatTimeout(chatId, room.turnEndTimerKey);

  const teamLabel = room.currentTeam === 'A' ? '🔴 Red' : '🔵 Blue';
  const explainerName = explainer.username ? `@${explainer.username}` : explainer.name;

  try {
    const privateMsg = formatText(t.alias?.your_word, { word: room.currentWord });
    bot.telegram.sendMessage(explainer.id, privateMsg || `🎩 Your word: <b>${room.currentWord}</b>`, { parse_mode: 'HTML' });
  } catch {}

  const turnStartMsg = formatText(t.alias?.turn_start, { team: teamLabel, explainer: explainerName })
    || (t.alias?.turnAnnounce?.(`📍 #${room.roomId}`, explainerName, teamLabel, TURN_SECONDS)
      ?? `🔥 <b>${teamLabel} turn!</b>\n${explainerName} is describing. ${TURN_SECONDS}s left.`);
  sendToRoom(bot, chatId, room.roomId, turnStartMsg, { parse_mode: 'HTML' });

  room.turnEndTimerKey = `alias_${room.roomId}_turn_${room.roundNumber}`;
  setChatTimeout(chatId, room.turnEndTimerKey, () => {
    clearChatTimeout(chatId, room.turnEndTimerKey);
    const roundEndMsg = formatText(t.alias?.round_end, { scoreA: room.scores.A, scoreB: room.scores.B })
      || (t.alias?.roundOver ?? '🛑 Time\'s up. Next turn.');
    sendToRoom(bot, chatId, room.roomId, roundEndMsg, { parse_mode: 'HTML' });
    void nextTurnOrEnd(bot, room);
  }, TURN_MS);
}

async function nextTurnOrEnd(bot: Telegraf<Context>, room: AliasRoom) {
  const teamPlayers = getTeamPlayers(room, room.currentTeam);
  room.explainerIndex += 1;
  if (room.explainerIndex >= teamPlayers.length) {
    room.explainerIndex = 0;
    room.currentTeam = room.currentTeam === 'A' ? 'B' : 'A';
    room.roundNumber += 1;
    if (room.roundNumber >= 8) {
      await endAliasGame(bot, room);
      return;
    }
  }
  await startTurn(bot, room);
}

async function endAliasGame(bot: Telegraf<Context>, room: AliasRoom) {
  const chatId = room.chatId;
  const t = getTexts(await getChatLanguage(chatId));
  const winner = room.scores.A >= room.scores.B ? '🔴 Red' : '🔵 Blue';
  const score = Math.max(room.scores.A, room.scores.B);
  const gameOverMsg = formatText(t.alias?.game_over, { winner })
    || (t.alias?.gameOver?.(winner, score) ?? `🏆 <b>Game Over!</b> Team ${winner} wins!`);
  sendToRoom(bot, chatId, room.roomId, gameOverMsg, {
    parse_mode: 'HTML',
    reply_markup: withGrowthButtons(t).reply_markup,
  });
  await releaseRoom(chatId, 'alias');
  endRoom(room);
  await setChatState(chatId, { currentGame: null, phase: 'idle', data: {} });
}

async function startAliasGame(bot: Telegraf<Context>, room: AliasRoom) {
  const { chatId, players } = room;
  const t = getTexts(await getChatLanguage(chatId));

  if (players.length < MIN_PLAYERS) {
    await sendToRoom(bot, chatId, room.roomId, t.bunker?.notEnoughToStart ?? `Need at least ${MIN_PLAYERS} players. Game cancelled.`, { parse_mode: 'HTML' });
    await releaseRoom(chatId, 'alias');
    endRoom(room);
    return;
  }

  const shuffled = shuffle(players);
  shuffled.forEach((p, i) => {
    p.team = i % 2 === 0 ? 'A' : 'B';
  });
  room.roundNumber = 1;
  room.currentTeam = 'A';
  room.explainerIndex = 0;
  room.scores = { A: 0, B: 0 };
  await setChatState(chatId, { currentGame: 'alias', phase: 'in_game', data: { aliasRoomId: room.roomId } });
  await startTurn(bot, room);
}

// ========== 注册 ==========

export function registerAlias(bot: Telegraf<Context>) {
  bot.action('start_alias', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        const lang = await getChatLanguage(ctx.chat?.id ?? 0);
        await ctx.reply(getTexts(lang).common.onlyGroups);
        return;
      }
      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      if (!(await tryAcquireRoom(chatId, 'alias'))) {
        const usage = await getChatRoomUsage(chatId);
        await ctx.reply(t.common.roomFull(usage.used, usage.max));
        return;
      }
      const room = createRoom(chatId);
      if (!room) {
        const usage = await getChatRoomUsage(chatId);
        await ctx.reply(t.common.roomFull(usage.used, usage.max));
        await releaseRoom(chatId, 'alias');
        return;
      }
      try {
        await ctx.editMessageReplyMarkup(undefined);
      } catch {}

      const botUsername = ctx.botInfo?.username;
      if (!botUsername) {
        await ctx.reply(t.errors.generic);
        await releaseRoom(chatId, 'alias');
        endRoom(room);
        return;
      }
      const link = `https://t.me/${botUsername}?start=alias_${chatId}_${room.roomId}`;
      await sendToRoom(bot, chatId, room.roomId, t.alias?.joinPrompt?.(link, MIN_PLAYERS, MAX_PLAYERS) ?? `Alias: Join via link. ${MIN_PLAYERS}-${MAX_PLAYERS} players. Start in 25s.\n${link}`, { parse_mode: 'HTML' });
      setChatTimeout(chatId, `alias_${room.roomId}_start`, () => {
        startAliasGame(bot, room).catch((err) => console.error('Alias start error', err));
      }, LOBBY_MS);
    } catch (err) {
      console.error('Alias entry error', err);
    }
  });

  bot.start(async (ctx) => {
    const payload = ctx.startPayload;
    if (!payload?.startsWith('alias_')) return;
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
    if (room.roundNumber > 0) {
      await ctx.reply(t.common.linkExpiredGameStarted);
      return;
    }
    const from = ctx.from;
    if (!from) {
      await ctx.reply(t.errors.generic);
      return;
    }
    if (room.players.some((p) => p.id === from.id)) {
      await ctx.reply(t.alias?.alreadyJoined ?? 'You already joined.');
      return;
    }
    if (room.players.length >= MAX_PLAYERS) {
      await ctx.reply(t.alias?.linkExpiredRoomFull?.(MAX_PLAYERS) ?? 'Room is full.');
      return;
    }
    const name = from.username ? `@${from.username}` : from.first_name || 'Player';
    room.players.push({
      id: from.id,
      name: from.username ? `@${from.username}` : from.first_name || 'Player',
      username: from.username,
      team: 'A',
    });
    await ctx.reply(t.alias?.joinSuccess ?? 'You joined Alias. Wait for the game to start in the group.');
    const names = room.players.map((p) => p.name).join(', ');
    await bot.telegram.sendMessage(chatId, t.alias?.currentPlayers?.(room.roomId, room.players.length, names) ?? `${getTexts(await getChatLanguage(chatId)).common.roomLabel(room.roomId)}\nPlayers: ${room.players.length} — ${names}`, { parse_mode: 'HTML' });
  });

  bot.on('text', async (ctx, next) => {
    try {
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return next();
      }
      const chatId = ctx.chat.id;
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'alias' || state.phase !== 'in_game') {
        return next();
      }
      const room = await getRoomForChat(chatId);
      if (!room || !room.active || !room.currentWord || !ctx.from) {
        return next();
      }

      const text = ctx.message.text?.trim() ?? '';
      if (!text) return next();

      const senderId = ctx.from.id;
      const sender = room.players.find((p) => p.id === senderId);
      if (!sender) return next();

      const t = getTexts(await getChatLanguage(chatId));

      const teamLabel = room.currentTeam === 'A' ? '🔴 Red' : '🔵 Blue';
      const explainerPlayer = room.explainerId != null ? room.players.find((x) => x.id === room.explainerId) : undefined;
      const explainerName = explainerPlayer ? (explainerPlayer.username ? `@${explainerPlayer.username}` : explainerPlayer.name) : '';

      if (senderId === room.explainerId) {
        if (containsWordRoot(text, room.currentWord)) {
          room.scores[room.currentTeam] = Math.max(0, room.scores[room.currentTeam] - 1);
          const foulMsg = formatText(t.alias?.foul_warning, { explainer: explainerName })
            ?? t.alias?.foulWordRoot ?? '❌ <b>Foul!</b> Explainer used the word root. -1 point.';
          await sendToRoom(bot, chatId, room.roomId, foulMsg, { parse_mode: 'HTML' });
          room.currentWord = pickWord(t);
          try {
            const nextWordMsg = formatText(t.alias?.your_word, { word: room.currentWord });
            await bot.telegram.sendMessage(senderId, nextWordMsg || `🎩 Next word: <b>${room.currentWord}</b>`, { parse_mode: 'HTML' });
          } catch {}
        }
        return next();
      }

      if (text.toLowerCase() !== room.currentWord.toLowerCase()) {
        return next();
      }

      if (sender.team !== room.currentTeam) {
        return next();
      }

      room.scores[room.currentTeam] += 1;
      const guesserName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name || 'Someone';
      const successMsg = formatText(t.alias?.correct_guess, { guesser: guesserName, team: teamLabel })
        ?? t.alias?.correctGuess?.(guesserName, room.currentWord) ?? `✅ <b>Bingo!</b> ${guesserName} +1 point.`;
      await sendToRoom(bot, chatId, room.roomId, successMsg, { parse_mode: 'HTML' });
      room.currentWord = pickWord(t);
      if (room.explainerId != null) {
        try {
          const nextWordMsg = formatText(t.alias?.your_word, { word: room.currentWord });
          await bot.telegram.sendMessage(room.explainerId, nextWordMsg || `🎩 Next word: <b>${room.currentWord}</b>`, { parse_mode: 'HTML' });
        } catch {}
      }
    } catch (err) {
      console.error('Alias text handler error', err);
    }
    return next();
  });
}
