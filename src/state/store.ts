/**
 * Redis-backed lightweight state store.
 * Falls back to in-memory maps in state.ts when Redis is disabled.
 */

import { getRedis } from './redisClient';
import type { ChatState, LanguageCode } from './types';

const TTL_USER_LANG = 60 * 60 * 24 * 30;
const TTL_CHAT_STATE = 60 * 60 * 24 * 7;

const ALLOWED_LANGS: LanguageCode[] = ['ru', 'en', 'zh'];

function keyUserLang(userId: number) {
  return `user:lang:${userId}`;
}

function keyChatState(chatId: number) {
  return `chat:state:${chatId}`;
}

export async function storeGetUserLanguage(userId: number): Promise<LanguageCode | undefined> {
  const redis = getRedis();
  if (!redis) return undefined;
  const v = await redis.get(keyUserLang(userId));
  if (v && ALLOWED_LANGS.includes(v as LanguageCode)) return v as LanguageCode;
  return undefined;
}

export async function storeSetUserLanguage(userId: number, lang: LanguageCode): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(keyUserLang(userId), lang, 'EX', TTL_USER_LANG);
}

export async function storeGetChatState(chatId: number): Promise<ChatState | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get(keyChatState(chatId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ChatState;
    if (parsed && typeof parsed.chatId === 'number' && 'phase' in parsed) {
      return parsed;
    }
  } catch {
    // ignore bad state
  }
  return null;
}

export async function storeSetChatState(state: ChatState): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(keyChatState(state.chatId), JSON.stringify(state), 'EX', TTL_CHAT_STATE);
}

export async function storeDelChatState(chatId: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(keyChatState(chatId));
}
