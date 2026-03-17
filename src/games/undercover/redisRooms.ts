/**
 * Redis-backed room storage for Undercover.
 * Rooms are stored as JSON in Redis hash `uc:rooms:{chatId}`.
 * Falls back to in-memory when Redis is not configured.
 *
 * Design: rooms are ephemeral game state. On process restart,
 * stale rooms are auto-cleaned (TTL 1 hour). Timers are NOT
 * persisted — a restarted process will find and clean up
 * orphaned rooms rather than trying to resume mid-game.
 */

import { getRedis } from '../../state/redisClient';
import { config } from '../../config';
import type { UndercoverRoom, UndercoverState } from './types';
import { MAX_ROOMS_PER_CHAT } from './types';
import { InMemoryRoomManager } from '../core/InMemoryRoomManager';

// ====== Redis keys ======
const HASH_PREFIX = 'uc:rooms:';
const TTL_SECONDS = 3600; // 1 hour — games don't last longer

function hashKey(chatId: number): string {
  return `${HASH_PREFIX}${chatId}`;
}

function fieldKey(roomId: number): string {
  return String(roomId);
}

// ====== Serialization ======
function serialize(room: UndercoverRoom): string {
  return JSON.stringify(room);
}

function deserialize(raw: string): UndercoverRoom | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.chatId === 'number' && typeof parsed.roomId === 'number') {
      return parsed as UndercoverRoom;
    }
  } catch { /* ignore */ }
  return null;
}

// ====== In-memory fallback ======
function createInitialState(): UndercoverState {
  return {
    players: [],
    undercoverUserIds: [],
    civilianWord: '',
    undercoverWord: '',
    phase: 'waiting',
    speakingIndex: 0,
    votes: {},
    roundNumber: 1,
  };
}

const memoryManager = new InMemoryRoomManager<UndercoverRoom>(
  MAX_ROOMS_PER_CHAT,
  (chatId, roomId) => ({
    chatId,
    roomId,
    state: createInitialState(),
    active: true,
    createdAt: Date.now(),
  }),
);

// ====== Unified API ======

export async function getRoom(chatId: number, roomId: number): Promise<UndercoverRoom | undefined> {
  if (!config.useRedis) return memoryManager.getRoom(chatId, roomId);
  const redis = getRedis();
  if (!redis) return memoryManager.getRoom(chatId, roomId);

  const raw = await redis.hget(hashKey(chatId), fieldKey(roomId));
  if (!raw) return undefined;
  const room = deserialize(raw);
  if (!room || !room.active) return undefined;
  return room;
}

export async function getActiveRooms(chatId: number): Promise<UndercoverRoom[]> {
  if (!config.useRedis) return memoryManager.getActiveRooms(chatId);
  const redis = getRedis();
  if (!redis) return memoryManager.getActiveRooms(chatId);

  const all = await redis.hgetall(hashKey(chatId));
  const rooms: UndercoverRoom[] = [];
  for (const raw of Object.values(all)) {
    const room = deserialize(raw);
    if (room && room.active) rooms.push(room);
  }
  return rooms;
}

export async function createRoom(chatId: number): Promise<UndercoverRoom | null> {
  if (!config.useRedis) return memoryManager.createRoom(chatId);
  const redis = getRedis();
  if (!redis) return memoryManager.createRoom(chatId);

  const all = await redis.hgetall(hashKey(chatId));
  const activeRooms: UndercoverRoom[] = [];
  for (const raw of Object.values(all)) {
    const room = deserialize(raw);
    if (room && room.active) activeRooms.push(room);
  }

  if (activeRooms.length >= MAX_ROOMS_PER_CHAT) return null;

  const usedIds = new Set(activeRooms.map((r) => r.roomId));
  let nextId = 1;
  while (usedIds.has(nextId) && nextId <= MAX_ROOMS_PER_CHAT) nextId++;
  if (nextId > MAX_ROOMS_PER_CHAT) return null;

  const room: UndercoverRoom = {
    chatId,
    roomId: nextId,
    state: createInitialState(),
    active: true,
    createdAt: Date.now(),
  };

  await redis.hset(hashKey(chatId), fieldKey(nextId), serialize(room));
  await redis.expire(hashKey(chatId), TTL_SECONDS);
  return room;
}

/**
 * Save room state back to Redis. Call this after any mutation to room.state.
 * In-memory mode: no-op (mutations are in-place on the JS object).
 */
export async function saveRoom(room: UndercoverRoom): Promise<void> {
  if (!config.useRedis) return;
  const redis = getRedis();
  if (!redis) return;
  await redis.hset(hashKey(room.chatId), fieldKey(room.roomId), serialize(room));
  await redis.expire(hashKey(room.chatId), TTL_SECONDS);
}

export async function endRoom(room: UndercoverRoom): Promise<void> {
  room.active = false;
  if (!config.useRedis) {
    memoryManager.endRoom(room);
    return;
  }
  const redis = getRedis();
  if (!redis) {
    memoryManager.endRoom(room);
    return;
  }
  await redis.hdel(hashKey(room.chatId), fieldKey(room.roomId));
}

/**
 * Iterate all rooms across all chats. Used by polling recovery.
 * In Redis mode, we scan for uc:rooms:* keys.
 */
export async function getAllRoomsByChat(): Promise<Map<number, UndercoverRoom[]>> {
  const result = new Map<number, UndercoverRoom[]>();

  if (!config.useRedis) {
    for (const [chatId, rooms] of memoryManager.entries()) {
      result.set(chatId, rooms);
    }
    return result;
  }

  const redis = getRedis();
  if (!redis) {
    for (const [chatId, rooms] of memoryManager.entries()) {
      result.set(chatId, rooms);
    }
    return result;
  }

  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `${HASH_PREFIX}*`, 'COUNT', 100);
    cursor = nextCursor;
    for (const key of keys) {
      const chatIdStr = key.substring(HASH_PREFIX.length);
      const chatId = Number(chatIdStr);
      if (!Number.isFinite(chatId)) continue;
      const all = await redis.hgetall(key);
      const rooms: UndercoverRoom[] = [];
      for (const raw of Object.values(all)) {
        const room = deserialize(raw);
        if (room) rooms.push(room);
      }
      if (rooms.length > 0) result.set(chatId, rooms);
    }
  } while (cursor !== '0');

  return result;
}
