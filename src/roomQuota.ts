/**
 * 按群房间配额：支持 Redis 持久化（20 万月活）
 */

import { getRedis } from './state/redisClient';
import { config } from './config';

export type RoomGameType = 'undercover' | 'word_bomb' | 'dice_guess' | 'bunker' | 'alias';

const MAX_ROOMS_PER_CHAT = 20;
const KEY_PREFIX = 'quota:chat:';

// 内存回退
const roomsPerChat = new Map<number, number>();

function redisKey(chatId: number): string {
  return `${KEY_PREFIX}${chatId}`;
}

export async function getChatRoomUsage(chatId: number): Promise<{ used: number; max: number }> {
  if (config.useRedis) {
    const redis = getRedis();
    if (redis) {
      const v = await redis.get(redisKey(chatId));
      const used = v ? parseInt(v, 10) : 0;
      return { used: Number.isFinite(used) ? used : 0, max: MAX_ROOMS_PER_CHAT };
    }
  }
  return { used: roomsPerChat.get(chatId) ?? 0, max: MAX_ROOMS_PER_CHAT };
}

export async function tryAcquireRoom(chatId: number, _game: RoomGameType): Promise<boolean> {
  if (config.useRedis) {
    const redis = getRedis();
    if (redis) {
      const key = redisKey(chatId);
      const cur = await redis.get(key);
      const used = cur ? parseInt(cur, 10) : 0;
      if (used >= MAX_ROOMS_PER_CHAT) return false;
      await redis.incr(key);
      await redis.expire(key, 60 * 60 * 24 * 7); // 7 天 TTL
      return true;
    }
  }
  const used = roomsPerChat.get(chatId) ?? 0;
  if (used >= MAX_ROOMS_PER_CHAT) return false;
  roomsPerChat.set(chatId, used + 1);
  return true;
}

export async function releaseRoom(chatId: number, _game: RoomGameType): Promise<void> {
  if (config.useRedis) {
    const redis = getRedis();
    if (redis) {
      const key = redisKey(chatId);
      const v = await redis.get(key);
      const used = v ? parseInt(v, 10) : 0;
      if (used <= 0) {
        await redis.del(key);
        return;
      }
      await redis.decr(key);
      return;
    }
  }
  const used = roomsPerChat.get(chatId) ?? 0;
  if (used <= 0) {
    roomsPerChat.set(chatId, 0);
    return;
  }
  roomsPerChat.set(chatId, used - 1);
}
