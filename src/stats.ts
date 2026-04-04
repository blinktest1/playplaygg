/**
 * Persistent counters stored in Redis.
 * Keys never expire — these are lifetime stats.
 *
 * Keys:
 *   stats:users         — SET of user IDs who ever /start-ed
 *   stats:groups        — SET of group IDs bot was added to
 *   stats:games:total   — total games started (all types)
 *   stats:games:uc      — undercover games started
 *   stats:games:tod     — truth-or-dare games started
 *   stats:msgs:group    — messages sent by bot in groups
 */

import { getRedis } from './state/redisClient';
import { logger } from './logger';

// ── Writes ──────────────────────────────────────────────────────────────

/** Track a unique user (call on /start or any private interaction) */
export async function trackUser(userId: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try { await r.sadd('stats:users', String(userId)); } catch (e) { logErr(e); }
}

/** Track a unique group (call when bot is added to a group) */
export async function trackGroup(chatId: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try { await r.sadd('stats:groups', String(chatId)); } catch (e) { logErr(e); }
}

/** Increment game-start counter */
export async function trackGameStart(type: 'uc' | 'tod'): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    const pipe = r.pipeline();
    pipe.incr('stats:games:total');
    pipe.incr(`stats:games:${type}`);
    await pipe.exec();
  } catch (e) { logErr(e); }
}

/** Increment group message counter (call once per bot reply in groups) */
export async function trackGroupMessage(): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try { await r.incr('stats:msgs:group'); } catch (e) { logErr(e); }
}

// ── Reads ───────────────────────────────────────────────────────────────

export interface BotStats {
  totalUsers: number;
  totalGroups: number;
  totalGames: number;
  ucGames: number;
  todGames: number;
  groupMessages: number;
}

export async function getStats(): Promise<BotStats> {
  const r = getRedis();
  if (!r) return { totalUsers: 0, totalGroups: 0, totalGames: 0, ucGames: 0, todGames: 0, groupMessages: 0 };
  const pipe = r.pipeline();
  pipe.scard('stats:users');
  pipe.scard('stats:groups');
  pipe.get('stats:games:total');
  pipe.get('stats:games:uc');
  pipe.get('stats:games:tod');
  pipe.get('stats:msgs:group');
  const results = await pipe.exec();
  const val = (i: number) => {
    const v = results?.[i]?.[1];
    return typeof v === 'number' ? v : Number(v) || 0;
  };
  return {
    totalUsers: val(0),
    totalGroups: val(1),
    totalGames: val(2),
    ucGames: val(3),
    todGames: val(4),
    groupMessages: val(5),
  };
}

function logErr(e: unknown) {
  logger.warn({ err: e instanceof Error ? e.message : String(e) }, 'stats write failed');
}
