/**
 * engine.ts — 谁是卧底核心游戏流程
 * startUndercoverGame → beginSpeakingRound → runSpeakingTurn → startFreeTalk
 *   → startVoting → tallyVotesAndProceed
 */
import { Context, Markup, Telegraf } from 'telegraf';
import { getChatLanguage, setChatTimeout, clearChatTimeout } from '../../state';
import { getTexts } from '../../i18n';
import { withGrowthButtons } from '../../growth';
import { releaseRoom } from '../../roomQuota';
import { logger, errMsg } from '../../logger';
import { endRoom, getRoom, saveRoom } from './redisRooms';
import {
  assignRolesAndWords,
  pickWordPair,
  recordWordPairUsed,
  suggestDifficulty,
  incrementChatGameCount,
} from './words';
import {
  COUNTDOWN_MS,
  FREE_TALK_MS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  SPEAK_TIME_MS,
  VOTE_TIMEOUT_MS,
  type UndercoverRoom,
} from './types';
import { checkWinCondition } from './winCondition';
import { buildGameOverReport, buildGroupReturnLink, formatSpeakingOrder, sendRoomMessage } from './messages';
import { trackGameStart, trackGroupMessage } from '../../stats';

// ─── Timer key helper ────────────────────────────────────────────────────────

export function timerKey(room: UndercoverRoom, suffix: string) {
  return `undercover_${room.roomId}_${suffix}`;
}

/**
 * Clean up all timers associated with a room.
 * Prevents stale callbacks from firing after game ends.
 */
function cleanupRoomTimers(chatId: number, roomId: number): void {
  const suffixes = [
    'countdown_10', 'start', 'speaking', 'free_talk', 'vote_timeout',
    'speak_10s_warn', 'freetalk_10s_warn', 'next_round',
  ];
  for (const suffix of suffixes) {
    clearChatTimeout(chatId, `undercover_${roomId}_${suffix}`);
  }
  // Also clear pending resolvers
  for (const phase of ['speaking', 'freetalk', 'vote'] as const) {
    pendingUndercoverResolvers.delete(`undercover_${chatId}_${roomId}_${phase}`);
  }
}

// ─── Pending resolvers (in-process skip mechanism) ───────────────────────────

/** key: undercover_${chatId}_${roomId}_speaking | freetalk | vote */
export const pendingUndercoverResolvers = new Map<
  string,
  {
    resolve: (result?: { forceEnd?: boolean }) => void;
    currentUserId?: number;
    timerSuffix: string;
  }
>();

export function hasActiveResolver(chatId: number, roomId: number): boolean {
  return (
    pendingUndercoverResolvers.has(`undercover_${chatId}_${roomId}_speaking`) ||
    pendingUndercoverResolvers.has(`undercover_${chatId}_${roomId}_freetalk`) ||
    pendingUndercoverResolvers.has(`undercover_${chatId}_${roomId}_vote`)
  );
}

/** 可被按键提前结束的等待；同时将 phaseDeadline 写入 Redis 供重启恢复。 */
export function waitWithSkipUndercover(
  chatId: number,
  roomId: number,
  phase: 'speaking' | 'freetalk' | 'vote',
  ms: number,
  currentUserId?: number,
): Promise<{ forceEnd?: boolean }> {
  const mapKey = `undercover_${chatId}_${roomId}_${phase}`;
  const timerSuffix =
    phase === 'speaking' ? 'speaking' : phase === 'freetalk' ? 'free_talk' : 'vote_timeout';
  const deadlineType =
    phase === 'speaking' ? 'speaking' : phase === 'freetalk' ? 'freetalk' : 'vote';

  // Write deadline to Redis (fire-and-forget; timer is primary mechanism)
  void (async () => {
    try {
      const room = await getRoom(chatId, roomId);
      if (room?.active) {
        room.phaseDeadline = Date.now() + ms;
        room.phaseDeadlineType = deadlineType as UndercoverRoom['phaseDeadlineType'];
        await saveRoom(room);
      }
    } catch (e) {
      logger.error({ chatId, roomId, err: errMsg(e) }, 'failed to write phaseDeadline');
    }
  })();

  return new Promise((resolve) => {
    setChatTimeout(
      chatId,
      `undercover_${roomId}_${timerSuffix}`,
      () => {
        pendingUndercoverResolvers.delete(mapKey);
        resolve({});
      },
      ms,
    );
    pendingUndercoverResolvers.set(mapKey, {
      resolve: (result) => {
        clearChatTimeout(chatId, `undercover_${roomId}_${timerSuffix}`);
        pendingUndercoverResolvers.delete(mapKey);
        void (async () => {
          try {
            const room = await getRoom(chatId, roomId);
            if (room) {
              room.phaseDeadline = undefined;
              room.phaseDeadlineType = undefined;
              await saveRoom(room);
            }
          } catch {}
        })();
        resolve(result ?? {});
      },
      currentUserId,
      timerSuffix,
    });
  });
}

// ─── Shuffle util ─────────────────────────────────────────────────────────────

// Re-export for backward compatibility (consumers that import shuffle from engine)
export { shuffle } from '../../utils';

// ─── Schedule next round (extracted to eliminate duplication) ─────────────────

async function scheduleNextRound(
  bot: Telegraf<Context>,
  room: UndercoverRoom,
): Promise<void> {
  const { chatId } = room;
  const t = getTexts(await getChatLanguage(chatId));

  room.state.roundNumber += 1;
  room.phaseDeadline = Date.now() + 5_000;
  room.phaseDeadlineType = 'next_round';
  await saveRoom(room);

  await sendRoomMessage(bot, chatId, room.roomId, `${t.undercover.nextRound} ⏱ 5s`);

  setChatTimeout(chatId, timerKey(room, 'next_round'), () => {
    void (async () => {
      const r = await getRoom(chatId, room.roomId);
      if (!r?.active) return;
      r.phaseDeadline = undefined;
      r.phaseDeadlineType = undefined;
      await saveRoom(r);
      await beginSpeakingRound(bot, r);
    })().catch((err) => logger.error({ chatId, err: errMsg(err) }, '下一轮启动异常'));
  }, 5_000);
}

// ─── End game with cleanup ───────────────────────────────────────────────────

async function endGameCleanup(room: UndercoverRoom): Promise<void> {
  cleanupRoomTimers(room.chatId, room.roomId);
  await endRoom(room);
  await releaseRoom(room.chatId, 'undercover');
}

// ─── "Play again" + growth buttons ──────────────────────────────────────────

function buildGameOverButtons(t: ReturnType<typeof getTexts>) {
  const growthRows = withGrowthButtons(t).reply_markup.inline_keyboard;
  const playAgainRow = [
    Markup.button.callback(t.undercover.btnPlayAgain ?? '🔄 再来一局', 'start_undercover'),
  ];
  return Markup.inlineKeyboard([playAgainRow, ...growthRows]);
}

// ─── Game flow ────────────────────────────────────────────────────────────────

export async function startUndercoverGame(bot: Telegraf<Context>, room: UndercoverRoom) {
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
    await endGameCleanup(room);
    return;
  }

  await sendRoomMessage(bot, chatId, room.roomId, t.undercover.startAnnounce(players.length));
  trackGameStart('uc');
  trackGroupMessage();

  const basePlayers = players.map((p) => ({ ...p, alive: true }));
  const chatGameCount = incrementChatGameCount(chatId);
  const difficulty = suggestDifficulty(chatGameCount);
  const [civilianWord, undercoverWord] = await pickWordPair(lang, chatId, difficulty);
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

  const blankLabel = t.undercover.blankWord ?? '(Blank)';
  const groupLink = buildGroupReturnLink(room);
  const returnLabel = t.undercover.returnToGroup ?? 'Return to group';
  for (const p of room.state.players) {
    try {
      const word = room.state.undercoverUserIds.includes(p.userId)
        ? room.state.undercoverWord
        : room.state.civilianWord;
      const wordMsg =
        word === ''
          ? (t.undercover.blankCivilianMessage ?? t.undercover.gameStartCivilian(blankLabel))
          : t.undercover.gameStartCivilian(word);
      const returnLine = `\n\n👉 <a href="${groupLink}">${returnLabel}</a>`;
      await bot.telegram.sendMessage(p.userId, `${wordMsg}${returnLine}`, { parse_mode: 'HTML' });
    } catch (e) {
      logger.warn({ chatId, userId: p.userId, err: errMsg(e) }, '私聊发词失败');
    }
  }

  try {
    await beginSpeakingRound(bot, room);
  } catch (err) {
    logger.error({ chatId, roomId: room.roomId, err: errMsg(err) }, 'beginSpeakingRound 异常');
    throw err;
  }
}

export async function beginSpeakingRound(bot: Telegraf<Context>, room: UndercoverRoom) {
  room.state.phase = 'speaking';
  room.state.speakingIndex = 0;
  room.state.votes = {};
  await saveRoom(room);
  await runSpeakingTurn(bot, room);
}

export async function runSpeakingTurn(bot: Telegraf<Context>, room: UndercoverRoom) {
  let currentRoom = room;

  while (true) {
    const { chatId } = currentRoom;
    const t = getTexts(await getChatLanguage(chatId));

    const alive = currentRoom.state.players.filter((p) => p.alive);
    const idx = currentRoom.state.speakingIndex;

    if (idx >= alive.length) {
      await startFreeTalk(bot, currentRoom);
      return;
    }

    const current = alive[idx];
    const orderLine = formatSpeakingOrder(alive, idx);
    const speakMsg = `📍 ${orderLine}\n\n${t.undercover.nowSpeaking(current.name)} ⏱ ${SPEAK_TIME_MS / 1000}s\n${t.undercover.speakButtonHint}`;

    await sendRoomMessage(bot, chatId, currentRoom.roomId, speakMsg, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback(t.undercover.btnEndSpeak, `undercover_skip_turn_${chatId}_${currentRoom.roomId}`)],
        ],
      },
    });

    if (SPEAK_TIME_MS > 10_000) {
      setChatTimeout(
        chatId,
        `undercover_${currentRoom.roomId}_speak_10s_warn`,
        async () => {
          try {
            const r = await getRoom(chatId, currentRoom.roomId);
            if (r?.active && r.state.phase === 'speaking')
              await sendRoomMessage(bot, chatId, currentRoom.roomId, '⏱ 10s');
          } catch {}
        },
        SPEAK_TIME_MS - 10_000,
      );
    }

    await waitWithSkipUndercover(chatId, currentRoom.roomId, 'speaking', SPEAK_TIME_MS, current.userId);
    clearChatTimeout(chatId, `undercover_${currentRoom.roomId}_speak_10s_warn`);

    const freshRoom = await getRoom(chatId, currentRoom.roomId);
    if (!freshRoom?.active) return;
    freshRoom.state.speakingIndex += 1;
    await saveRoom(freshRoom);
    currentRoom = freshRoom;
  }
}

export async function startFreeTalk(bot: Telegraf<Context>, room: UndercoverRoom) {
  const { chatId } = room;
  const t = getTexts(await getChatLanguage(chatId));

  room.state.phase = 'free_talk';
  await saveRoom(room);

  await sendRoomMessage(bot, chatId, room.roomId, `${t.undercover.freeTalk} ⏱ ${FREE_TALK_MS / 1000}s`, {
    reply_markup: {
      inline_keyboard: [
        [Markup.button.callback(t.undercover.btnEndRound, `undercover_skip_freetalk_${chatId}_${room.roomId}`)],
      ],
    },
  });

  if (FREE_TALK_MS > 10_000) {
    setChatTimeout(
      chatId,
      `undercover_${room.roomId}_freetalk_10s_warn`,
      async () => {
        try {
          const r = await getRoom(chatId, room.roomId);
          if (r?.active && r.state.phase === 'free_talk')
            await sendRoomMessage(bot, chatId, room.roomId, '⏱ 10s');
        } catch {}
      },
      FREE_TALK_MS - 10_000,
    );
  }

  await waitWithSkipUndercover(chatId, room.roomId, 'freetalk', FREE_TALK_MS);
  clearChatTimeout(chatId, `undercover_${room.roomId}_freetalk_10s_warn`);

  const freshRoom = await getRoom(chatId, room.roomId);
  if (!freshRoom?.active) return;
  await startVoting(bot, freshRoom);
}

export async function startVoting(bot: Telegraf<Context>, room: UndercoverRoom) {
  const { chatId } = room;
  const t = getTexts(await getChatLanguage(chatId));

  room.state.phase = 'voting';
  room.state.votes = {};
  await saveRoom(room);

  const alive = room.state.players.filter((p) => p.alive);

  // Build inline keyboard: one button per alive player (vote target)
  const voteButtons = alive.map((p) =>
    [Markup.button.callback(
      `🗳 ${p.name}`,
      `uc_vote_${chatId}_${room.roomId}_${p.userId}`,
    )],
  );
  // Add "end game" button
  voteButtons.push([
    Markup.button.callback(
      `🛑 ${t.undercover.btnEndGame}`,
      `undercover_force_end_${chatId}_${room.roomId}`,
    ),
  ]);

  const panelLines = alive.map((p) => `• ${p.name}`).join('\n');

  await sendRoomMessage(
    bot, chatId, room.roomId,
    `${t.undercover.votePrompt} ⏱ ${VOTE_TIMEOUT_MS / 1000}s\n\n${panelLines}`,
    {
      reply_markup: Markup.inlineKeyboard(voteButtons).reply_markup,
    },
  );

  const result = await waitWithSkipUndercover(chatId, room.roomId, 'vote', VOTE_TIMEOUT_MS);

  if (result.forceEnd) {
    await sendRoomMessage(bot, chatId, room.roomId, t.undercover.gameForceEnded ?? 'Game force-ended.');
    await endGameCleanup(room);
    return;
  }
  await tallyVotesAndProceed(bot, room);
}

export async function tallyVotesAndProceed(bot: Telegraf<Context>, room: UndercoverRoom) {
  const { chatId } = room;
  const lang = await getChatLanguage(chatId);
  const t = getTexts(lang);

  // Re-read room to get latest votes (may have been written atomically by castVote)
  const freshRoom = await getRoom(chatId, room.roomId);
  if (!freshRoom?.active) return;
  const state = freshRoom.state;

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
  const tallyLineFn =
    t.undercover.tallyLine ??
    ((name: string, count: number, voters: string) => `${name}  ${count}票 <<< ${voters}`);
  const noVotes = t.undercover.noVotesInTally ?? '（无人投票）';

  const tallyLines = entries.map((e) => {
    const target = state.players.find((p) => p.userId === e.targetId);
    const voterNames = e.voterIds
      .map((id) => state.players.find((p) => p.userId === id)?.name ?? String(id))
      .join(', ');
    return tallyLineFn(target?.name ?? String(e.targetId), e.count, voterNames);
  });

  const tallyBody =
    tallyLines.length > 0
      ? `${tallyTitle}\n${tallyLines.join('\n')}`
      : `${tallyTitle}\n${noVotes}`;

  await sendRoomMessage(bot, chatId, freshRoom.roomId, tallyBody);

  // 无人投票 → 结束本局
  if (entries.length === 0) {
    await sendRoomMessage(bot, chatId, freshRoom.roomId, t.undercover.noVotesRetry);
    await endGameCleanup(freshRoom);
    return;
  }

  const top = entries[0];
  const tied = entries.filter((e) => e.count === top.count);

  // 平票 → 下一轮
  if (tied.length > 1) {
    const tieMsg =
      t.undercover.tieNoElimination?.(top.count) ??
      `⚖️ 投票结算出现平票（最高票数为 ${top.count} 票）！\n本轮无人被淘汰，游戏继续！`;
    await sendRoomMessage(bot, chatId, freshRoom.roomId, tieMsg);
    await scheduleNextRound(bot, freshRoom);
    return;
  }

  // 正常淘汰
  const eliminated = state.players.find((p) => p.userId === top.targetId);
  if (!eliminated) return;
  eliminated.alive = false;
  await saveRoom(freshRoom);
  await sendRoomMessage(bot, chatId, freshRoom.roomId, t.undercover.eliminated(eliminated.name));

  const winResult = checkWinCondition(state.players);
  if (winResult !== 'continue') {
    const isCivWin = winResult === 'civilians_win';
    const winnerLabel = isCivWin
      ? (t.undercover.civiliansLabel ?? '平民阵营')
      : (t.undercover.undercoverLabel ?? '卧底阵营');
    const subtitle = isCivWin
      ? (t.undercover.civiliansWinSubtitle ?? '卧底无处遁形！')
      : (t.undercover.undercoverWinSubtitle ?? '平民已无力回天...');
    const report = buildGameOverReport(freshRoom, winnerLabel, subtitle, lang);
    await sendRoomMessage(
      bot, chatId, freshRoom.roomId,
      isCivWin ? t.undercover.civiliansWin : t.undercover.undercoverWins,
      { reply_markup: buildGameOverButtons(t).reply_markup, parse_mode: 'HTML' },
    );
    await sendRoomMessage(bot, chatId, freshRoom.roomId, report, { parse_mode: 'HTML' });
    await endGameCleanup(freshRoom);
    return;
  }

  await scheduleNextRound(bot, freshRoom);
}

/** 处理轮询发现的过期 phaseDeadline（重启恢复） */
export async function handleExpiredDeadline(
  bot: Telegraf<Context>,
  room: UndercoverRoom,
  deadlineType: string | undefined,
): Promise<void> {
  const phase = room.state.phase;
  if (phase === 'speaking') {
    room.state.speakingIndex += 1;
    await saveRoom(room);
    await runSpeakingTurn(bot, room);
  } else if (phase === 'free_talk') {
    await startVoting(bot, room);
  } else if (phase === 'voting') {
    await tallyVotesAndProceed(bot, room);
  } else if (deadlineType === 'next_round') {
    await beginSpeakingRound(bot, room);
  } else if (phase === 'waiting') {
    await startUndercoverGame(bot, room);
  }
}
