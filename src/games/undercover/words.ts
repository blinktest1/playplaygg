/**
 * Word-pair selection and role assignment logic for Undercover.
 * Supports difficulty tiers: early rounds get easier pairs, later rounds get harder.
 *
 * 数据源优先级：Redis (wordStore) → 硬编码 (undercoverWords.ts)
 */

import { randomInt } from 'node:crypto';
import type { LanguageCode } from '../../state';
import type { UndercoverPlayer } from './types';
import { LruMap } from '../../lruMap';
import { getWordPairs, filterByDifficulty } from './wordStore';

const RECENT_WORD_PAIRS_PER_CHAT = 24;
/** Max number of chats to track word history for (LRU eviction) */
const MAX_TRACKED_CHATS = 2000;

const recentWordPairsByChat = new LruMap<number, string[]>(MAX_TRACKED_CHATS);

/** Per-chat completed game counter for progressive difficulty across sessions */
const chatGameCounter = new LruMap<number, number>(MAX_TRACKED_CHATS);

/** Increment and return the chat's game count (call at game start) */
export function incrementChatGameCount(chatId: number): number {
  const count = (chatGameCounter.get(chatId) ?? 0) + 1;
  chatGameCounter.set(chatId, count);
  return count;
}

const P_UNDERCOVER_BLANK = 10;
const P_CIVILIAN_BLANK = 5;

function pairKey(lang: string, civ: string, uc: string): string {
  return `${lang}:${civ}:${uc}`;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'any';

/**
 * Pick a word pair with optional difficulty filter.
 * Reads from Redis first, falls back to hardcoded word pairs.
 */
export async function pickWordPair(
  lang: LanguageCode,
  chatId?: number,
  difficulty: Difficulty = 'any',
): Promise<[string, string]> {
  const allEntries = await getWordPairs(lang);
  if (allEntries.length === 0) return ['Doctor', 'Nurse'];

  // Filter by difficulty
  let pool = filterByDifficulty(allEntries, difficulty);
  if (pool.length === 0) pool = allEntries;

  // Extract raw pairs
  let pairs = pool.map((e) => e.pair);

  // Filter out recently used pairs
  if (chatId != null) {
    const recent = new Set(recentWordPairsByChat.get(chatId) ?? []);
    const fresh = pairs.filter(([c, u]) => !recent.has(pairKey(lang, c, u)));
    if (fresh.length > 0) pairs = fresh;
  }

  const basePair = pairs[randomInt(0, pairs.length)];
  if (basePair[0] === '' || basePair[1] === '') return basePair;

  // 50% chance to swap civilian/spy words
  let [civWord, ucWord] = basePair;
  if (randomInt(0, 2) === 0) [civWord, ucWord] = [ucWord, civWord];

  // Dynamic blank rounds (disabled for easy difficulty — new players find blank confusing)
  if (difficulty !== 'easy') {
    const r = randomInt(0, 100);
    if (r < P_UNDERCOVER_BLANK) return [civWord, ''];
    if (r < P_UNDERCOVER_BLANK + P_CIVILIAN_BLANK) return ['', ucWord];
  }
  return [civWord, ucWord];
}

export function recordWordPairUsed(chatId: number, lang: string, civ: string, uc: string): void {
  const list = recentWordPairsByChat.get(chatId) ?? [];
  const key = pairKey(lang, civ, uc);
  recentWordPairsByChat.set(chatId, [...list, key].slice(-RECENT_WORD_PAIRS_PER_CHAT));
}

export function getSpyCount(playerCount: number): number {
  if (playerCount >= 5 && playerCount <= 6) return 1;
  if (playerCount >= 7 && playerCount <= 9) return 2;
  if (playerCount >= 10 && playerCount <= 12) return 3;
  return Math.max(1, Math.floor(playerCount / 4));
}

export function assignRolesAndWords(
  players: UndercoverPlayer[],
  civWord: string,
  spyWord: string,
): UndercoverPlayer[] {
  const spyCount = getSpyCount(players.length);
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  shuffled.forEach((p, i) => {
    if (i < spyCount) {
      p.role = 'SPY';
      p.word = spyWord;
    } else {
      p.role = 'CIVILIAN';
      p.word = civWord;
    }
  });
  return shuffled;
}

/**
 * Suggest difficulty based on how many games this chat has played.
 * Game 1: easy, Game 2-3: medium, Game 4+: hard
 */
export function suggestDifficulty(gameCount: number): Difficulty {
  if (gameCount <= 1) return 'easy';
  if (gameCount <= 3) return 'medium';
  return 'hard';
}
