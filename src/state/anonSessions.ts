/**
 * Persistent anonymous-wall DM sessions.
 *
 * Why this exists:
 * - In-memory only sessions are lost on deploy/restart
 * - Users may click the deep link, switch apps, and send later
 * - We want the DM → group forwarding flow to survive process restarts
 */

import { LruMap } from '../lruMap';
import { getRedis } from './redisClient';

export interface AnonSession {
  chatId: number;
  topic: string;
}

const mem = new LruMap<number, AnonSession>(20_000);
const TTL_SECONDS = 60 * 60 * 6; // 6 hours is long enough for a live wall

function key(userId: number) {
  return `anon:session:${userId}`;
}

export async function getAnonSession(userId: number): Promise<AnonSession | undefined> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(key(userId));
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as AnonSession;
      if (parsed && typeof parsed.chatId === 'number' && typeof parsed.topic === 'string') {
        return parsed;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }
  return mem.get(userId);
}

export async function setAnonSession(userId: number, session: AnonSession): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(key(userId), JSON.stringify(session), 'EX', TTL_SECONDS);
    return;
  }
  mem.set(userId, session);
}

export async function delAnonSession(userId: number): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(key(userId));
    return;
  }
  mem.delete(userId);
}
