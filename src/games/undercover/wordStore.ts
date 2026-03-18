/**
 * wordStore.ts — Redis-backed word pair storage
 *
 * 词库优先从 Redis 读取（key: uc:words:{lang}），
 * Redis 为空时 fallback 到 undercoverWords.ts 硬编码文件。
 *
 * Redis 数据格式：Hash
 *   key: uc:words:{lang}
 *   field: "{civ}|{uc}"
 *   value: JSON {"difficulty":"easy","tags":["general"]}
 *
 * 提供 seedWordsToRedis(lang) 将硬编码词库写入 Redis（首次部署用）。
 * 提供 addWordPair / removeWordPair 运营级增删词对。
 */

import { getRedis } from '../../state/redisClient';
import { config } from '../../config';
import { logger, errMsg } from '../../logger';
import { WORD_PAIRS_BY_LANG } from '../undercoverWords';
import type { Difficulty } from './words';

// ─── Redis keys ──────────────────────────────────────────────────────────────

const WORDS_KEY_PREFIX = 'uc:words:';

function wordsKey(lang: string): string {
  return `${WORDS_KEY_PREFIX}${lang}`;
}

function fieldKey(civ: string, uc: string): string {
  return `${civ}|${uc}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WordPairMeta {
  difficulty: Difficulty;
  tags?: string[];
  /** 被标记为禁用（软删除），不参与选词 */
  disabled?: boolean;
}

export interface WordPairWithMeta {
  pair: [string, string];
  meta: WordPairMeta;
}

// ─── Difficulty ranges for hardcoded fallback ────────────────────────────────

const DIFFICULTY_RANGES: Record<string, { easy: number; medium: number }> = {
  zh: { easy: 20, medium: 52 },
  en: { easy: 20, medium: 45 },
  ru: { easy: 20, medium: 45 },
};

function inferDifficulty(lang: string, index: number): Difficulty {
  const ranges = DIFFICULTY_RANGES[lang] ?? { easy: 20, medium: 45 };
  if (index < ranges.easy) return 'easy';
  if (index < ranges.easy + ranges.medium) return 'medium';
  return 'hard';
}

// ─── Core: load word pairs ───────────────────────────────────────────────────

/**
 * 从 Redis 加载指定语言的词库。
 * 返回 null 表示 Redis 不可用或词库为空（应 fallback）。
 */
async function loadFromRedis(lang: string): Promise<WordPairWithMeta[] | null> {
  if (!config.useRedis) return null;
  const redis = getRedis();
  if (!redis) return null;

  try {
    const all = await redis.hgetall(wordsKey(lang));
    if (!all || Object.keys(all).length === 0) return null;

    const results: WordPairWithMeta[] = [];
    for (const [field, raw] of Object.entries(all)) {
      const parts = field.split('|');
      if (parts.length !== 2) continue;
      try {
        const meta = JSON.parse(raw) as WordPairMeta;
        if (meta.disabled) continue; // 跳过被禁用的词对
        results.push({
          pair: [parts[0], parts[1]],
          meta,
        });
      } catch {
        // Malformed entry — skip
      }
    }
    return results.length > 0 ? results : null;
  } catch (err) {
    logger.warn({ lang, err: errMsg(err) }, 'loadFromRedis failed, falling back to hardcoded');
    return null;
  }
}

/**
 * 从硬编码文件加载（fallback）。
 */
function loadFromHardcoded(lang: string): WordPairWithMeta[] {
  const pairs = WORD_PAIRS_BY_LANG[lang] || WORD_PAIRS_BY_LANG.en;
  if (!pairs || pairs.length === 0) return [];
  return pairs.map((pair, index) => ({
    pair,
    meta: { difficulty: inferDifficulty(lang, index) },
  }));
}

/**
 * 获取词库：Redis 优先，fallback 到硬编码。
 * 调用方无需关心数据来源。
 */
export async function getWordPairs(lang: string): Promise<WordPairWithMeta[]> {
  const fromRedis = await loadFromRedis(lang);
  if (fromRedis && fromRedis.length > 0) return fromRedis;
  return loadFromHardcoded(lang);
}

/**
 * 按难度过滤词对。
 */
export function filterByDifficulty(
  pairs: WordPairWithMeta[],
  difficulty: Difficulty | 'any',
): WordPairWithMeta[] {
  if (difficulty === 'any') return pairs;
  return pairs.filter((p) => p.meta.difficulty === difficulty);
}

// ─── Seed: 将硬编码词库写入 Redis ────────────────────────────────────────────

/**
 * 将硬编码词库 seed 到 Redis。
 * 仅写入不存在的词对（不覆盖已有的，保护运营手动修改的数据）。
 * 返回新增的词对数量。
 */
export async function seedWordsToRedis(lang: string): Promise<number> {
  if (!config.useRedis) return 0;
  const redis = getRedis();
  if (!redis) return 0;

  const hardcoded = loadFromHardcoded(lang);
  if (hardcoded.length === 0) return 0;

  const key = wordsKey(lang);
  let added = 0;

  // Use pipeline for efficiency
  const pipeline = redis.pipeline();
  for (const entry of hardcoded) {
    const field = fieldKey(entry.pair[0], entry.pair[1]);
    pipeline.hsetnx(key, field, JSON.stringify(entry.meta));
  }

  const results = await pipeline.exec();
  if (results) {
    for (const [err, result] of results) {
      if (!err && result === 1) added++;
    }
  }

  logger.info({ lang, total: hardcoded.length, added }, 'seedWordsToRedis done');
  return added;
}

/**
 * 将所有语言的词库 seed 到 Redis。
 */
export async function seedAllLanguages(): Promise<void> {
  for (const lang of Object.keys(WORD_PAIRS_BY_LANG)) {
    await seedWordsToRedis(lang);
  }
}

// ─── CRUD: 运营级词对管理 ────────────────────────────────────────────────────

/**
 * 添加一个词对到 Redis。如果已存在则覆盖。
 */
export async function addWordPair(
  lang: string,
  civ: string,
  uc: string,
  difficulty: Difficulty,
  tags?: string[],
): Promise<boolean> {
  if (!config.useRedis) return false;
  const redis = getRedis();
  if (!redis) return false;

  const meta: WordPairMeta = { difficulty, tags };
  await redis.hset(wordsKey(lang), fieldKey(civ, uc), JSON.stringify(meta));
  logger.info({ lang, civ, uc, difficulty }, 'addWordPair');
  return true;
}

/**
 * 软删除一个词对（标记 disabled，不从 Redis 移除）。
 */
export async function disableWordPair(
  lang: string,
  civ: string,
  uc: string,
): Promise<boolean> {
  if (!config.useRedis) return false;
  const redis = getRedis();
  if (!redis) return false;

  const field = fieldKey(civ, uc);
  const raw = await redis.hget(wordsKey(lang), field);
  if (!raw) return false;

  try {
    const meta = JSON.parse(raw) as WordPairMeta;
    meta.disabled = true;
    await redis.hset(wordsKey(lang), field, JSON.stringify(meta));
    logger.info({ lang, civ, uc }, 'disableWordPair');
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取词库统计（用于监控/管理界面）。
 */
export async function getWordStats(lang: string): Promise<{
  total: number;
  active: number;
  byDifficulty: Record<string, number>;
}> {
  const pairs = await getWordPairs(lang);
  const byDifficulty: Record<string, number> = {};
  for (const p of pairs) {
    byDifficulty[p.meta.difficulty] = (byDifficulty[p.meta.difficulty] ?? 0) + 1;
  }
  return {
    total: pairs.length,
    active: pairs.length, // disabled ones are already filtered out
    byDifficulty,
  };
}
