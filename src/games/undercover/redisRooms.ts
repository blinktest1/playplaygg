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
const ACTIVE_CHATS_KEY = 'uc:active_chats';
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

/**
 * Lua script: atomic create room.
 * Reads all fields in the hash, counts active rooms, finds next available ID,
 * and writes the new room — all in one atomic operation.
 *
 * KEYS[1] = hash key (uc:rooms:{chatId})
 * KEYS[2] = active chats set key (uc:active_chats)
 * ARGV[1] = max rooms per chat
 * ARGV[2] = chatId (string)
 * ARGV[3] = TTL seconds
 * ARGV[4] = initial room JSON template (without roomId — we fill it in Lua)
 *
 * Returns: roomId (number) on success, 0 if full.
 */
const LUA_CREATE_ROOM = `
  local hashKey = KEYS[1]
  local activeChatKey = KEYS[2]
  local maxRooms = tonumber(ARGV[1])
  local chatId = ARGV[2]
  local ttl = tonumber(ARGV[3])
  local templateJson = ARGV[4]

  local all = redis.call('HGETALL', hashKey)
  local usedIds = {}
  local activeCount = 0

  -- all is [field1, value1, field2, value2, ...]
  for i = 1, #all, 2 do
    local raw = all[i + 1]
    -- Quick check: look for "active":true in JSON
    if raw and string.find(raw, '"active":true', 1, true) then
      activeCount = activeCount + 1
      local fieldId = tonumber(all[i])
      if fieldId then
        usedIds[fieldId] = true
      end
    end
  end

  if activeCount >= maxRooms then
    return 0
  end

  local nextId = 0
  for id = 1, maxRooms do
    if not usedIds[id] then
      nextId = id
      break
    end
  end

  if nextId == 0 then
    return 0
  end

  -- Inject roomId into the template JSON
  -- Template has "roomId":0 placeholder
  local roomJson = string.gsub(templateJson, '"roomId":0', '"roomId":' .. nextId, 1)

  redis.call('HSET', hashKey, tostring(nextId), roomJson)
  redis.call('EXPIRE', hashKey, ttl)
  redis.call('SADD', activeChatKey, chatId)

  return nextId
`;

export async function createRoom(chatId: number): Promise<UndercoverRoom | null> {
  if (!config.useRedis) return memoryManager.createRoom(chatId);
  const redis = getRedis();
  if (!redis) return memoryManager.createRoom(chatId);

  // Build template with roomId=0 as placeholder (Lua will replace)
  const template: UndercoverRoom = {
    chatId,
    roomId: 0,
    state: createInitialState(),
    active: true,
    createdAt: Date.now(),
  };

  const result = await redis.eval(
    LUA_CREATE_ROOM,
    2,
    hashKey(chatId),
    ACTIVE_CHATS_KEY,
    String(MAX_ROOMS_PER_CHAT),
    String(chatId),
    String(TTL_SECONDS),
    serialize(template),
  );

  const roomId = Number(result);
  if (!roomId || roomId <= 0) return null;

  // Return the room object with correct roomId
  template.roomId = roomId;
  return template;
}

/**
 * Lua script: atomic vote write.
 * Reads the room JSON, injects the vote into state.votes, writes back.
 * Returns 1 on success, 0 if room not found or not in voting phase.
 *
 * KEYS[1] = hash key (uc:rooms:{chatId})
 * ARGV[1] = room field key (roomId as string)
 * ARGV[2] = voter userId (string)
 * ARGV[3] = target userId (string)
 */
const LUA_CAST_VOTE = `
  local raw = redis.call('HGET', KEYS[1], ARGV[1])
  if not raw then return 0 end

  local room = cjson.decode(raw)
  if not room or not room.state then return 0 end
  if room.state.phase ~= 'voting' then return 0 end

  if not room.state.votes then
    room.state.votes = {}
  end
  room.state.votes[ARGV[2]] = tonumber(ARGV[3])

  redis.call('HSET', KEYS[1], ARGV[1], cjson.encode(room))
  return 1
`;

/**
 * Atomic vote: write a single vote without read-modify-write race.
 * Falls back to in-memory mutation when Redis is disabled.
 * Returns true if the vote was recorded.
 */
export async function castVote(
  chatId: number,
  roomId: number,
  voterId: number,
  targetId: number,
): Promise<boolean> {
  if (!config.useRedis) {
    // In-memory: direct mutation is safe (single-threaded)
    const room = memoryManager.getRoom(chatId, roomId);
    if (!room?.active || room.state.phase !== 'voting') return false;
    room.state.votes[voterId] = targetId;
    return true;
  }
  const redis = getRedis();
  if (!redis) {
    const room = memoryManager.getRoom(chatId, roomId);
    if (!room?.active || room.state.phase !== 'voting') return false;
    room.state.votes[voterId] = targetId;
    return true;
  }

  const result = await redis.eval(
    LUA_CAST_VOTE,
    1,
    hashKey(chatId),
    fieldKey(roomId),
    String(voterId),
    String(targetId),
  );
  return result === 1;
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
  // Remove chat from active set if no rooms remain
  const remaining = await redis.hlen(hashKey(room.chatId));
  if (remaining === 0) {
    await redis.srem(ACTIVE_CHATS_KEY, String(room.chatId));
  }
}

/**
 * Iterate all rooms across all active chats. Used by polling recovery.
 * P0-3 fix: uses uc:active_chats SET instead of SCAN, O(active) not O(total).
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

  const chatIds = await redis.smembers(ACTIVE_CHATS_KEY);
  for (const chatIdStr of chatIds) {
    const chatId = Number(chatIdStr);
    if (!Number.isFinite(chatId)) continue;
    const all = await redis.hgetall(hashKey(chatId));
    const rooms: UndercoverRoom[] = [];
    for (const raw of Object.values(all)) {
      const room = deserialize(raw);
      if (room) rooms.push(room);
    }
    if (rooms.length > 0) {
      result.set(chatId, rooms);
    } else {
      // Stale entry in active set — clean up
      await redis.srem(ACTIVE_CHATS_KEY, chatIdStr);
    }
  }

  return result;
}
