/**
 * Per-chat room quota with atomic Redis operations.
 * Uses Lua scripts to prevent race conditions under concurrent access.
 */

import { getRedis } from './state/redisClient';
import { config } from './config';

export type RoomGameType = 'undercover';

const MAX_ROOMS_PER_CHAT = 20;
const KEY_PREFIX = 'quota:chat:';
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// In-memory fallback
const roomsPerChat = new Map<number, number>();

function redisKey(chatId: number): string {
  return `${KEY_PREFIX}${chatId}`;
}

// Lua: atomic check-and-increment. Returns 1 if acquired, 0 if full.
const LUA_TRY_ACQUIRE = `
  local key = KEYS[1]
  local max = tonumber(ARGV[1])
  local ttl = tonumber(ARGV[2])
  local cur = tonumber(redis.call('GET', key) or '0')
  if cur >= max then return 0 end
  redis.call('INCR', key)
  redis.call('EXPIRE', key, ttl)
  return 1
`;

// Lua: atomic decrement (floor at 0). Returns new value.
const LUA_RELEASE = `
  local key = KEYS[1]
  local cur = tonumber(redis.call('GET', key) or '0')
  if cur <= 0 then
    redis.call('DEL', key)
    return 0
  end
  local nv = redis.call('DECR', key)
  return nv
`;

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
      const result = await redis.eval(
        LUA_TRY_ACQUIRE,
        1,
        redisKey(chatId),
        String(MAX_ROOMS_PER_CHAT),
        String(TTL_SECONDS),
      );
      return result === 1;
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
      await redis.eval(LUA_RELEASE, 1, redisKey(chatId));
      return;
    }
  }
  const used = roomsPerChat.get(chatId) ?? 0;
  roomsPerChat.set(chatId, Math.max(0, used - 1));
}
