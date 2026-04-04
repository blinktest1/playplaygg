/**
 * Global chat state with optional Redis persistence.
 * Game timers are still process-local for now.
 */

import { config } from './config';
import * as store from './state/store';
import { LruMap } from './lruMap';

export type { ChatState, ChatGameType, ChatPhase, LanguageCode, TimerKey } from './state/types';
import type { ChatState, LanguageCode, TimerKey } from './state/types';

/** In-memory fallback stores — LRU-bounded to prevent OOM on long-running processes */
const chatStates = new LruMap<number, ChatState>(10_000);
const userLanguage = new LruMap<number, LanguageCode>(50_000);
const timers = new Map<string, NodeJS.Timeout>();

const ALLOWED_LANGS: LanguageCode[] = ['ru', 'en', 'zh'];

function defaultChatState(chatId: number): ChatState {
  return {
    chatId,
    currentGame: null,
    phase: 'idle',
    data: { lang: 'en' },
  };
}

function timerMapKey(chatId: number, key: TimerKey): string {
  return `${chatId}:${key}`;
}

export async function getOrCreateChatState(chatId: number): Promise<ChatState> {
  if (config.useRedis) {
    const st = await store.storeGetChatState(chatId);
    if (st) return st;
    const def = defaultChatState(chatId);
    await store.storeSetChatState(def);
    return def;
  }
  let state = chatStates.get(chatId);
  if (!state) {
    state = defaultChatState(chatId);
    chatStates.set(chatId, state);
  }
  return state;
}

export async function setChatState(chatId: number, partial: Partial<ChatState>): Promise<ChatState> {
  const state = await getOrCreateChatState(chatId);
  const next: ChatState = {
    ...state,
    ...partial,
    data: { ...state.data, ...(partial.data ?? {}) },
  };
  if (config.useRedis) {
    await store.storeSetChatState(next);
  } else {
    chatStates.set(chatId, next);
  }
  return next;
}

export async function getChatLanguage(chatId: number): Promise<LanguageCode> {
  const state = await getOrCreateChatState(chatId);
  const lang = state.data?.['lang'];
  if (lang && ALLOWED_LANGS.includes(lang as LanguageCode)) return lang as LanguageCode;
  return 'en';
}

export async function setChatLanguage(chatId: number, lang: LanguageCode): Promise<void> {
  const state = await getOrCreateChatState(chatId);
  const next: ChatState = {
    ...state,
    data: { ...state.data, lang },
  };
  if (config.useRedis) {
    await store.storeSetChatState(next);
  } else {
    chatStates.set(chatId, next);
  }
}

export async function getUserLanguage(userId: number): Promise<LanguageCode | undefined> {
  if (config.useRedis) return store.storeGetUserLanguage(userId);
  return userLanguage.get(userId);
}

export async function setUserLanguage(userId: number, lang: LanguageCode): Promise<void> {
  if (config.useRedis) {
    await store.storeSetUserLanguage(userId, lang);
  } else {
    userLanguage.set(userId, lang);
  }
}

export async function resetChatState(chatId: number): Promise<void> {
  const lang = await getChatLanguage(chatId);
  const next: ChatState = {
    chatId,
    currentGame: null,
    phase: 'idle',
    data: { lang },
  };
  if (config.useRedis) {
    await store.storeSetChatState(next);
  } else {
    chatStates.set(chatId, next);
  }
}

export async function clearAllStates(): Promise<void> {
  if (!config.useRedis) {
    chatStates.clear();
    userLanguage.clear();
  }
  for (const timeout of timers.values()) clearTimeout(timeout);
  timers.clear();
}

export function setChatTimeout(chatId: number, key: TimerKey, fn: () => void, ms: number): void {
  const mapKey = timerMapKey(chatId, key);
  const existing = timers.get(mapKey);
  if (existing) clearTimeout(existing);
  const timeout = setTimeout(() => {
    timers.delete(mapKey);
    fn();
  }, ms);
  timers.set(mapKey, timeout);
}

export function clearChatTimeout(chatId: number, key: TimerKey): void {
  const mapKey = timerMapKey(chatId, key);
  const existing = timers.get(mapKey);
  if (existing) {
    clearTimeout(existing);
    timers.delete(mapKey);
  }
}

export function clearAllChatTimers(chatId: number): void {
  const prefix = `${chatId}:`;
  for (const [k, timeout] of timers.entries()) {
    if (k.startsWith(prefix)) {
      clearTimeout(timeout);
      timers.delete(k);
    }
  }
}
