/**
 * Word-pair selection and role assignment logic for Undercover.
 * Supports difficulty tiers: early rounds get easier pairs, later rounds get harder.
 */

import { randomInt } from 'node:crypto';
import type { LanguageCode } from '../../state';
import type { UndercoverPlayer } from './types';
import { WORD_PAIRS_BY_LANG } from '../undercoverWords';

const RECENT_WORD_PAIRS_PER_CHAT = 24;
const recentWordPairsByChat = new Map<number, string[]>();

const P_UNDERCOVER_BLANK = 10;
const P_CIVILIAN_BLANK = 5;

function pairKey(lang: string, civ: string, uc: string): string {
  return `${lang}:${civ}:${uc}`;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'any';

/**
 * Difficulty ranges per language — index boundaries in the flat WORD_PAIRS_BY_LANG arrays.
 * The arrays are ordered: easy first, then medium, then hard.
 */
const DIFFICULTY_RANGES: Record<string, { easy: number; medium: number }> = {
  zh: { easy: 20, medium: 52 },   // 0-19 easy, 20-51 medium, 52+ hard
  en: { easy: 20, medium: 45 },
  ru: { easy: 20, medium: 45 },
};

/**
 * Pick a word pair with optional difficulty filter.
 * - 'easy': clear differences, newbie-friendly
 * - 'medium': similar, needs skill to describe
 * - 'hard': extremely similar, slang/meme, expert-level
 * - 'any': full pool (default)
 */
export function pickWordPair(
  lang: LanguageCode,
  chatId?: number,
  difficulty: Difficulty = 'any',
): [string, string] {
  const allPairs = WORD_PAIRS_BY_LANG[lang] || WORD_PAIRS_BY_LANG.en;
  if (!allPairs || allPairs.length === 0) return ['Doctor', 'Nurse'];

  const ranges = DIFFICULTY_RANGES[lang] ?? { easy: 20, medium: Math.floor(allPairs.length * 0.6) };

  let pool: [string, string][];
  switch (difficulty) {
    case 'easy':
      pool = allPairs.slice(0, ranges.easy);
      break;
    case 'medium':
      pool = allPairs.slice(ranges.easy, ranges.easy + ranges.medium);
      break;
    case 'hard':
      pool = allPairs.slice(ranges.easy + ranges.medium);
      break;
    default:
      pool = allPairs;
  }

  if (pool.length === 0) pool = allPairs;

  // Filter out recently used pairs
  if (chatId != null) {
    const recent = new Set(recentWordPairsByChat.get(chatId) ?? []);
    const fresh = pool.filter(([c, u]) => !recent.has(pairKey(lang, c, u)));
    if (fresh.length > 0) pool = fresh;
  }

  const basePair = pool[randomInt(0, pool.length)];
  if (basePair[0] === '' || basePair[1] === '') return basePair;

  // 50% chance to swap civilian/spy words
  let [civWord, ucWord] = basePair;
  if (randomInt(0, 2) === 0) [civWord, ucWord] = [ucWord, civWord];

  // Dynamic blank rounds
  const r = randomInt(0, 100);
  if (r < P_UNDERCOVER_BLANK) return [civWord, ''];
  if (r < P_UNDERCOVER_BLANK + P_CIVILIAN_BLANK) return ['', ucWord];
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
 * Suggest difficulty based on round number — progressive difficulty.
 * Round 1: easy, Round 2-3: medium, Round 4+: hard
 */
export function suggestDifficulty(roundNumber: number): Difficulty {
  if (roundNumber <= 1) return 'easy';
  if (roundNumber <= 3) return 'medium';
  return 'hard';
}
