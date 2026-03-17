import { Context, Markup, Telegraf } from 'telegraf';
import { getChatLanguage, setChatTimeout, clearChatTimeout } from '../state';
import { getTexts } from '../i18n';
import { withGrowthButtons } from '../growth';
import { tryAcquireRoom, releaseRoom, getChatRoomUsage } from '../roomQuota';
import { EMOJI_POOL, activeVotingEmojis, releaseVotingEmojis, normalizeVoteText } from './votingEmojis';
import { createRoom, endRoom, getActiveRooms, getAllRoomsByChat, getRoom, saveRoom } from './undercover/redisRooms';
import {
  assignRolesAndWords,
  pickWordPair,
  recordWordPairUsed,
  suggestDifficulty,
} from './undercover/words';
import {
  COUNTDOWN_MS,
  FREE_TALK_MS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  SPEAK_TIME_MS,
  VOTE_TIMEOUT_MS,
  type UndercoverPlayer,
  type UndercoverRoom,
} from './undercover/types';
import { checkWinCondition } from './undercover/winCondition';

function writeUndercoverError(prefix: string, err: unknown): void {
  console.error(`[undercover] ${prefix}`, (err as Error)?.message ?? err);
}

function timerKey(room: UndercoverRoom, suffix: string) {
  return `undercover_${room.roomId}_${suffix}`;
}

/** 发言/自由讨论/投票阶段「提前结束」解析器。key: undercover_${chatId}_${roomId}_speaking | freetalk | vote */
const pendingUndercoverResolvers = new Map<string, {
  resolve: (result?: { forceEnd?: boolean }) => void;
  currentUserId?: number;
  timerSuffix: string;
}>();

/** 当前处于投票阶段的 chatId → 该群「结束游戏」按钮文案（用于文本匹配） */
const currentUndercoverVotingEndGameByChat = new Map<number, string>();

/** 可被按键提前结束的等待。phase: speaking | freetalk | vote */
function waitWithSkipUndercover(
  chatId: number,
  roomId: number,
  phase: 'speaking' | 'freetalk' | 'vote',
  ms: number,
  currentUserId?: number,
): Promise<{ forceEnd?: boolean }> {
  const mapKey = `undercover_${chatId}_${roomId}_${phase}`;
  const timerSuffix = phase === 'speaking' ? 'speaking' : phase === 'freetalk' ? 'free_talk' : 'vote_timeout';
  return new Promise((resolve) => {
    setChatTimeout(chatId, `undercover_${roomId}_${timerSuffix}` as import('../state').TimerKey, () => {
      pendingUndercoverResolvers.delete(mapKey);
      resolve({});
    }, ms);
    pendingUndercoverResolvers.set(mapKey, {
      resolve: (result) => {
        clearChatTimeout(chatId, `undercover_${roomId}_${timerSuffix}` as import('../state').TimerKey);
        pendingUndercoverResolvers.delete(mapKey);
        resolve(result ?? {});
      },
      currentUserId,
      timerSuffix,
    });
  });
}

/** 生成返回群组的 Telegram 链接：公开群用 t.me/username/msgId，私有超级群用 t.me/c/chatId/msgId */
function buildGroupReturnLink(room: {
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

/** 向该房间所在群发送消息，自动附带 🎪 N号房间 前缀 */
async function sendRoomMessage(
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

// ===== 工具函数 =====

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatSpeakingOrder(players: UndercoverPlayer[], currentIndex: number): string {
  return players
    .filter((p) => p.alive)
    .map((p, i) => (i === currentIndex ? `📍${p.name}` : p.name))
    .join(' > ');
}

// ===== 注册入口 =====

/** 轮询：检查是否有「应已开始但未开始」的等待中房间（补偿 setTimeout 未触发的情况） */
function startUndercoverPolling(bot: Telegraf<Context>) {
  const INTERVAL_MS = 10_000;
  setInterval(async () => {
    const now = Date.now();
    const allRooms = await getAllRoomsByChat();
    for (const [chatId, list] of allRooms) {
      for (const room of list) {
        if (
          room.active &&
          room.state.phase === 'waiting' &&
          room.createdAt != null &&
          now - room.createdAt >= COUNTDOWN_MS
        ) {
          room.createdAt = undefined;
          await saveRoom(room);
          void startUndercoverGame(bot, room).catch((err) =>
            // eslint-disable-next-line no-console
            console.error('谁是卧底轮询启动异常', err),
          );
        }
      }
    }
  }, INTERVAL_MS);
}

export function registerUndercover(bot: Telegraf<Context>) {
  startUndercoverPolling(bot);

  // 在群里点击"开始谁是卧底"时创建一个房间
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

      // 清除介绍消息上的按键，避免叠加
      try {
        await ctx.editMessageReplyMarkup(undefined);
      } catch {
        // 忽略编辑失败
      }

      const sent = await sendRoomMessage(bot, chatId, newRoom.roomId, joinText);
      if (sent?.message_id) newRoom.recruitmentMessageId = sent.message_id;
      await saveRoom(newRoom);

      // 报名倒计时：只在 10s 时提醒一次
      setChatTimeout(chatId, timerKey(newRoom, 'countdown_10'), async () => {
        const texts = getTexts(await getChatLanguage(chatId));
        await sendRoomMessage(bot, chatId, newRoom.roomId, texts.undercover.countdown10s);
      }, COUNTDOWN_MS - 10_000);

      // 35 秒后关闭报名并尝试启动该房间游戏（回调内重新从 map 取房间，避免闭包引用过期）
      const roomChatId = newRoom.chatId;
      const roomId = newRoom.roomId;
      setChatTimeout(chatId, timerKey(newRoom, 'start'), () => {
        void (async () => {
          const room = await getRoom(roomChatId, roomId);
          if (!room || !room.active) {
            try {
              const t = getTexts(await getChatLanguage(roomChatId));
              await bot.telegram.sendMessage(roomChatId, t.common.roomClosedOrNotFound); // 房间已不存在，不带头衔
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('谁是卧底房间未找到时发信异常', e);
            }
            return;
          }
          try {
            await startUndercoverGame(bot, room);
          } catch (err) {
            const errMsg = (err as Error)?.message ?? String(err);
            const errStack = (err as Error)?.stack;
            writeUndercoverError('谁是卧底房间倒计时结束异常', err);
            // eslint-disable-next-line no-console
            console.error('谁是卧底房间倒计时结束异常', errMsg, errStack ?? '');
            try {
              const t = getTexts(await getChatLanguage(roomChatId));
              const isRightsError = /rights|permission|forbidden|blocked|chat not found|not found|can't send|cannot send/i.test(errMsg);
              const msg = isRightsError && t.undercover.startFailedNoRights
                ? t.undercover.startFailedNoRights
                : (t.undercover.startFailed ?? t.errors.generic);
              await sendRoomMessage(bot, roomChatId, roomId, msg);
            } catch {
              // ignore
            }
          }
        })();
      }, COUNTDOWN_MS);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('处理谁是卧底入口异常', err);
    }
  });

  // 私聊 /start 报名：payload = undercover_<chatId>_<roomId>（从链接点进时可能在 message.text 里）
  bot.start(async (ctx) => {
    const rawPayload = ctx.startPayload ?? ('text' in (ctx.message || {}) ? String((ctx.message as { text?: string }).text || '').replace(/^\/start\s*/, '').trim() : '');
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
      if (!room || !room.active) {
        await ctx.reply(t.common.roomClosedOrNotFound);
        return;
      }

      if (room.state.phase !== 'waiting') {
        await ctx.reply(t.undercover.linkExpiredGameStarted);
        return;
      }

      const from = ctx.from;
      if (!from) {
        await ctx.reply(t.errors.generic);
        return;
      }

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
        name: from.username || from.first_name || from.last_name || '?',
        username: from.username,
        alive: true,
      });
      await saveRoom(room);

      await ctx.reply(joinMsg, { parse_mode: 'HTML' });

      const names = room.state.players.map((p) => p.name).join(', ');
      const t2 = getTexts(await getChatLanguage(chatId));
      await bot.telegram.sendMessage(
        chatId,
        t2.undercover.currentRoomPlayers(room.roomId, room.state.players.length, names),
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('处理谁是卧底报名异常', err);
      const chatId = ctx.chat?.id;
      const tErr = getTexts(typeof chatId === 'number' ? await getChatLanguage(chatId) : 'ru');
      await ctx.reply(tErr.errors.generic);
    }
  });

  // 结束发言（仅当前发言人可点）
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
      const userId = ctx.from?.id;
      if (userId !== pending.currentUserId) {
        await ctx.answerCbQuery(t.undercover.notYourTurn ?? 'Not your turn', { show_alert: true });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('谁是卧底结束发言按键异常', err);
    }
  });

  // 结束回合（自由讨论阶段，任何人可点）
  bot.action(/^undercover_skip_freetalk_(-?\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) return;
      const t = getTexts(await getChatLanguage(chatId));
      const room = await getRoom(chatId, roomId);
      if (!room || !room.active) {
        await ctx.answerCbQuery(t.undercover.roundEnded, { show_alert: false });
        return;
      }
      const userId = ctx.from?.id;
      const isPlayer = userId != null && room.state.players.some((p) => p.userId === userId);
      if (!isPlayer) {
        await ctx.answerCbQuery(t.undercover.notInThisGame, { show_alert: true });
        return;
      }
      const mapKey = `undercover_${chatId}_${roomId}_freetalk`;
      const pending = pendingUndercoverResolvers.get(mapKey);
      if (!pending) {
        await ctx.answerCbQuery(t.undercover.alreadyEnded ?? 'Ended', { show_alert: false });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('谁是卧底结束回合按键异常', err);
    }
  });

  // 结束游戏（投票阶段，inline 保留以便兼容；主要靠 Reply Keyboard 发「结束游戏」文本）
  bot.action(/^undercover_force_end_(-?\d+)_(\d+)$/, async (ctx) => {
    try {
      const chatId = Number(ctx.match[1]);
      const roomId = Number(ctx.match[2]);
      if (!Number.isFinite(chatId) || !Number.isFinite(roomId)) return;
      const t = getTexts(await getChatLanguage(chatId));
      const mapKey = `undercover_${chatId}_${roomId}_vote`;
      const pending = pendingUndercoverResolvers.get(mapKey);
      if (!pending) {
        await ctx.answerCbQuery(t.undercover.alreadyEnded ?? 'Ended', { show_alert: false });
        return;
      }
      await ctx.answerCbQuery();
      pending.resolve({ forceEnd: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('谁是卧底结束游戏按键异常', err);
    }
  });

  // 文本投票：发专属 Emoji 投票 / 发「结束游戏」强制结束
  bot.on('text', async (ctx, next) => {
    const text = ctx.message?.text?.trim();
    if (!text) return next();
    const chatId = ctx.chat?.id;
    if (typeof chatId !== 'number' || (ctx.chat?.type !== 'group' && ctx.chat?.type !== 'supergroup')) return next();

    const t = getTexts(await getChatLanguage(chatId));
    const btnEndGame = t.undercover.btnEndGame;

    if (text === btnEndGame || text === currentUndercoverVotingEndGameByChat.get(chatId)) {
      const list = await getActiveRooms(chatId);
      const votingRoom = list.find((r) => r.active && r.state.phase === 'voting');
      if (votingRoom) {
        const mapKey = `undercover_${chatId}_${votingRoom.roomId}_vote`;
        const pending = pendingUndercoverResolvers.get(mapKey);
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
      if (info.game !== 'undercover') return next();
      const room = await getRoom(info.chatId, info.roomId);
      if (!room || room.state.phase !== 'voting' || room.chatId !== chatId) return next();
      const voterId = ctx.from?.id;
      if (!voterId) return next();
      const voter = room.state.players.find((p) => p.userId === voterId && p.alive);
      if (!voter) return next();
      room.state.votes[voterId] = info.targetId;
      await saveRoom(room);
      const voteConfirm = t.undercover.voteDone(info.targetName);
      await ctx.reply(voteConfirm, {
        reply_parameters: { message_id: ctx.message.message_id },
      });
      return;
    }

    return next();
  });
}

// ===== 游戏流程 =====

async function startUndercoverGame(bot: Telegraf<Context>, room: UndercoverRoom) {
  if (room.state.phase !== 'waiting') return;
  room.createdAt = undefined;

  const { chatId } = room;
  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  const players = room.state.players;
  if (players.length < MIN_PLAYERS) {
    const msg = t.undercover.startCancelledWithCount
      ? t.undercover.startCancelledWithCount(players.length, MIN_PLAYERS)
      : t.undercover.startCancelled;
    await sendRoomMessage(bot, chatId, room.roomId, msg);
    await endRoom(room);
    await releaseRoom(chatId, 'undercover');
    return;
  }

  await sendRoomMessage(bot, chatId, room.roomId, t.undercover.startAnnounce(players.length));

  const basePlayers = players.map((p) => ({ ...p, alive: true }));
  const difficulty = suggestDifficulty(room.state.roundNumber);
  const [civilianWord, undercoverWord] = pickWordPair(lang, chatId, difficulty);
  recordWordPairUsed(chatId, lang, civilianWord, undercoverWord);
  const playersWithRoles = assignRolesAndWords(basePlayers, civilianWord, undercoverWord);
  const undercoverUserIds = playersWithRoles.filter((p) => p.role === 'SPY').map((p) => p.userId);

  room.state = {
    ...room.state,
    players: playersWithRoles,
    undercoverUserIds,
    civilianWord,
    undercoverWord,
    phase: 'assigning',
    speakingIndex: 0,
    votes: {},
    roundNumber: 1,
  };
  await saveRoom(room);

  // 只发词，不透露身份：所有人用同一套中性文案
  const blankLabel = t.undercover.blankWord ?? '(Blank)';
  for (const p of room.state.players) {
    try {
      const isUndercover = room.state.undercoverUserIds.includes(p.userId);
      const word = isUndercover ? room.state.undercoverWord : room.state.civilianWord;
      const isBlank = word === '';
      const msg = isBlank
        ? (t.undercover.blankCivilianMessage ?? t.undercover.gameStartCivilian(blankLabel))
        : t.undercover.gameStartCivilian(word);
      await bot.telegram.sendMessage(p.userId, msg);
    } catch (e) {
      // 忽略无法私聊的用户，但记录日志便于排查
      // eslint-disable-next-line no-console
      console.warn('谁是卧底私聊发词失败', p.userId, (e as Error)?.message);
    }
  }

  try {
    await beginSpeakingRound(bot, room);
  } catch (err) {
    writeUndercoverError('谁是卧底 beginSpeakingRound 异常', err);
    // eslint-disable-next-line no-console
    console.error('谁是卧底 beginSpeakingRound 异常', err);
    throw err;
  }
}

async function beginSpeakingRound(bot: Telegraf<Context>, room: UndercoverRoom) {
  const { chatId } = room;
  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  room.state.phase = 'speaking';
  room.state.speakingIndex = 0;
  room.state.votes = {};
  await saveRoom(room);

  // 不再单独发顺序公告，直接进入第一个人的发言（顺序在每条发言消息里显示）
  await runSpeakingTurn(bot, room);
}

async function runSpeakingTurn(bot: Telegraf<Context>, room: UndercoverRoom) {
  const { chatId } = room;
  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  const alive = room.state.players.filter((p) => p.alive);
  const idx = room.state.speakingIndex;

  if (idx >= alive.length) {
    await startFreeTalk(bot, room);
    return;
  }

  const current = alive[idx];
  const orderLine = formatSpeakingOrder(alive, idx);
  // 合并：顺序 + 发言人 + 倒计时 → 一条消息
  const speakMsg = `📍 ${orderLine}\n\n${t.undercover.nowSpeaking(current.name)} ⏱ ${SPEAK_TIME_MS / 1000}s\n${t.undercover.speakButtonHint}`;
  const btnEndSpeak = t.undercover.btnEndSpeak;
  await sendRoomMessage(bot, chatId, room.roomId, speakMsg, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[Markup.button.callback(btnEndSpeak, `undercover_skip_turn_${chatId}_${room.roomId}`)]],
    },
  });

  await waitWithSkipUndercover(chatId, room.roomId, 'speaking', SPEAK_TIME_MS, current.userId);
  const stillRoom = await getRoom(chatId, room.roomId);
  if (!stillRoom || !stillRoom.active) return;
  room.state.speakingIndex += 1;
  await saveRoom(room);
  await runSpeakingTurn(bot, room);
}

async function startFreeTalk(bot: Telegraf<Context>, room: UndercoverRoom) {
  const { chatId } = room;
  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  room.state.phase = 'free_talk';
  await saveRoom(room);

  // 自由讨论：一条消息搞定
  const btnEndRound = t.undercover.btnEndRound;
  const freeTalkMsg = `${t.undercover.freeTalk} ⏱ ${FREE_TALK_MS / 1000}s`;
  await sendRoomMessage(bot, chatId, room.roomId, freeTalkMsg, {
    reply_markup: {
      inline_keyboard: [[Markup.button.callback(btnEndRound, `undercover_skip_freetalk_${chatId}_${room.roomId}`)]],
    },
  });

  await waitWithSkipUndercover(chatId, room.roomId, 'freetalk', FREE_TALK_MS);
  const stillRoom = await getRoom(chatId, room.roomId);
  if (!stillRoom || !stillRoom.active) return;
  await startVoting(bot, room);
}

async function startVoting(bot: Telegraf<Context>, room: UndercoverRoom) {
  const { chatId } = room;
  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  room.state.phase = 'voting';
  room.state.votes = {};
  await saveRoom(room);

  const alive = room.state.players.filter((p) => p.alive);
  // 首次进入投票阶段时分配 emojiByPlayerId，整局游戏内保持不变；
  // 后续所有投票（包括重投和新一轮）都复用这张表，直到游戏结束才释放。
  if (!room.emojiByPlayerId) {
    room.emojiByPlayerId = {};
    room.votingEmojis = [];
    const shuffledAlive = shuffle([...alive]);
    for (const p of shuffledAlive) {
      const availableEmojis = EMOJI_POOL.filter((e) => !activeVotingEmojis.has(normalizeVoteText(e)));
      if (availableEmojis.length === 0) {
        await sendRoomMessage(bot, chatId, room.roomId, t.undercover.votingEnded ?? '投票资源不足，本局结束。');
        await endRoom(room);
        await releaseRoom(chatId, 'undercover');
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableEmojis.length);
      const selectedEmoji = availableEmojis[randomIndex];
      const key = normalizeVoteText(selectedEmoji);
      room.emojiByPlayerId![p.userId] = key;
      room.votingEmojis!.push(key);
      activeVotingEmojis.set(key, {
        game: 'undercover',
        chatId,
        roomId: room.roomId,
        targetId: p.userId,
        targetName: p.name,
      });
    }
    await saveRoom(room);
  }

  const btnEndGame = t.undercover.btnEndGame;
  let panelLines = '';
  const buttons: string[] = [];
  for (const p of alive) {
    const emoji = room.emojiByPlayerId![p.userId];
    if (emoji) {
      panelLines += `${emoji} - ${p.name}\n`;
      buttons.push(emoji);
    }
  }
  currentUndercoverVotingEndGameByChat.set(chatId, btnEndGame);
  // 为了在最多 12 名玩家时也有良好排版，将表情按键按 6 个一行分组
  const rows: string[][] = [];
  for (let i = 0; i < buttons.length; i += 6) {
    rows.push(buttons.slice(i, i + 6));
  }
  rows.push([btnEndGame]);
  const replyKeyboard = Markup.keyboard(rows).oneTime().resize();
  // 投票面板 + 倒计时合并为一条
  await sendRoomMessage(bot, chatId, room.roomId, `${t.undercover.votePrompt} ⏱ ${VOTE_TIMEOUT_MS / 1000}s\n\n${panelLines.trim()}`, {
    reply_markup: replyKeyboard.reply_markup,
  });

  const result = await waitWithSkipUndercover(chatId, room.roomId, 'vote', VOTE_TIMEOUT_MS);
  currentUndercoverVotingEndGameByChat.delete(chatId);
  if (result.forceEnd) {
    releaseVotingEmojis(room.votingEmojis);
    room.votingEmojis = undefined;
    room.emojiByPlayerId = undefined;
    await endRoom(room);
    await releaseRoom(chatId, 'undercover');
    const endMsg = t.undercover.gameForceEnded ?? 'Game force-ended.';
    await sendRoomMessage(bot, chatId, room.roomId, endMsg, { reply_markup: { remove_keyboard: true } });
    return;
  }
  await tallyVotesAndProceed(bot, room);
}

function buildGameOverReport(room: UndercoverRoom, winnerLabel: string, subtitle: string): string {
  const spyList = room.state.players
    .filter((p) => p.role === 'SPY')
    .map((p) => `@${p.name}`)
    .join(' , ');
  const civList = room.state.players
    .filter((p) => p.role === 'CIVILIAN')
    .map((p) => `@${p.name}`)
    .join(' , ');
  const spyWordDisplay = room.state.undercoverWord || '🚫 白板';
  const civWordDisplay = room.state.civilianWord || '🚫 白板';

  return (
    `🚩 <b>游戏结束！</b>

` +
    `🕵️‍♂️ <b>卧底 (${spyWordDisplay})：</b> ${spyList || '（无）'}
` +
    `👨‍🌾 <b>平民 (${civWordDisplay})：</b> ${civList || '（无）'}

` +
    `🏆 <b>[ ${winnerLabel} ] 完胜！</b>
` +
    `<i>${subtitle}</i>`
  );
}

async function tallyVotesAndProceed(bot: Telegraf<Context>, room: UndercoverRoom) {
  const { chatId } = room;
  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  const state = room.state;
  const alive = state.players.filter((p) => p.alive);

  // targetId -> voterIds[]
  const votesByTarget: Record<number, number[]> = {};
  for (const [voterIdStr, targetId] of Object.entries(state.votes)) {
    const vid = Number(voterIdStr);
    if (!votesByTarget[targetId]) votesByTarget[targetId] = [];
    votesByTarget[targetId].push(vid);
  }
  const entries = (Object.entries(votesByTarget) as [string, number[]][])
    .map(([tid, arr]) => ({ targetId: Number(tid), count: arr.length, voterIds: arr }))
    .filter((v) => v.count > 0)
    .sort((a, b) => b.count - a.count);

  const tallyTitle = t.undercover.tallyTitle ?? '🗳 投票结算：';
  const tallyLineFn = t.undercover.tallyLine ?? ((name: string, count: number, voters: string) => `${name}  ${count}票 <<< ${voters}`);
  const noVotes = t.undercover.noVotesInTally ?? '（无人投票）';
  const tallyLines: string[] = [];
  for (const e of entries) {
    const target = state.players.find((p) => p.userId === e.targetId);
    const voterNames = e.voterIds.map((id) => state.players.find((p) => p.userId === id)?.name ?? String(id)).join(', ');
    tallyLines.push(tallyLineFn(target?.name ?? String(e.targetId), e.count, voterNames));
  }
  const tallyBody = tallyLines.length > 0 ? `${tallyTitle}\n${tallyLines.join('\n')}` : `${tallyTitle}\n${noVotes}`;
  await sendRoomMessage(bot, chatId, room.roomId, tallyBody, {
    reply_markup: { remove_keyboard: true },
  });

  // 情况一：无人投票（所有人得票为 0）
  if (entries.length === 0) {
    // 本轮无人投票：直接结束本局，避免无限重投
    await sendRoomMessage(bot, chatId, room.roomId, t.undercover.noVotesRetry, {
      reply_markup: { remove_keyboard: true },
    });
    releaseVotingEmojis(room.votingEmojis);
    room.votingEmojis = undefined;
    room.emojiByPlayerId = undefined;
    await endRoom(room);
    await releaseRoom(chatId, 'undercover');
    return;
  }

  // 情况二：有人得票，判断是否平票
  const top = entries[0];
  const tied = entries.filter((e) => e.count === top.count);
  const maxVotes = top.count;

  // 情况 B：出现平票（多人最高票）→ 无人淘汰，直接下一轮
  if (tied.length > 1) {
    const tieMsg =
      t.undercover.tieNoElimination?.(maxVotes) ??
      `⚖️ 投票结算出现平票（最高票数为 ${maxVotes} 票）！\n本轮无人被淘汰，游戏继续！`;
    await sendRoomMessage(bot, chatId, room.roomId, tieMsg, {
      reply_markup: { remove_keyboard: true },
    });

    const stillAlive = state.players.filter((p) => p.alive);
    // 这里不做胜负判定，直接进入下一轮发言
    state.roundNumber += 1;
    await saveRoom(room);
    await sendRoomMessage(bot, chatId, room.roomId, `${t.undercover.nextRound} ⏱ 5s`, {
      reply_markup: { remove_keyboard: true },
    });
    setChatTimeout(chatId, timerKey(room, 'next_round'), () => {
      void (async () => {
      const stillRoom2 = await getRoom(chatId, room.roomId);
      if (!stillRoom2 || !stillRoom2.active) return;
      await beginSpeakingRound(bot, stillRoom2);
      })().catch((err) =>
        console.error('谁是卧底下一轮启动异常', err),
      );
    }, 5_000);
    return;
  }

  // 情况 A：唯一最高票 → 正常淘汰
  const eliminatedId: number | null = top.targetId;

  const eliminated = state.players.find((p) => p.userId === eliminatedId);
  if (!eliminated) return;

  eliminated.alive = false;
  await saveRoom(room);

  await sendRoomMessage(bot, chatId, room.roomId, t.undercover.eliminated(eliminated.name), {
    reply_markup: { remove_keyboard: true },
  });

  const result = checkWinCondition(state.players);

  if (result !== 'continue') {
    const isCivWin = result === 'civilians_win';
    const report = buildGameOverReport(
      room,
      isCivWin ? '平民阵营' : '卧底阵营',
      isCivWin ? '卧底无处遁形！' : '平民已无力回天...',
    );
    releaseVotingEmojis(room.votingEmojis);
    room.votingEmojis = undefined;
    room.emojiByPlayerId = undefined;
    await sendRoomMessage(
      bot, chatId, room.roomId,
      isCivWin ? t.undercover.civiliansWin : t.undercover.undercoverWins,
      { reply_markup: withGrowthButtons(t).reply_markup, parse_mode: 'HTML' },
    );
    await sendRoomMessage(bot, chatId, room.roomId, report, { parse_mode: 'HTML' });
    await endRoom(room);
    await releaseRoom(chatId, 'undercover');
    return;
  }

  state.roundNumber += 1;
  await saveRoom(room);
  await sendRoomMessage(bot, chatId, room.roomId, `${t.undercover.nextRound} ⏱ 5s`, {
    reply_markup: { remove_keyboard: true },
  });
  setChatTimeout(chatId, timerKey(room, 'next_round'), () => {
    void (async () => {
    const stillRoom2 = await getRoom(chatId, room.roomId);
    if (!stillRoom2 || !stillRoom2.active) return;
    await beginSpeakingRound(bot, stillRoom2);
    })().catch((err) =>
      console.error('谁是卧底下一轮启动异常', err),
    );
  }, 5_000);
}
