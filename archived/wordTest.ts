import { Context, Telegraf } from 'telegraf';
import { getChatLanguage, getOrCreateChatState, setChatState, setChatTimeout, clearChatTimeout, resetChatState } from '../state';
import { withGrowthButtons } from '../growth';
import { getTexts } from '../i18n';

// 中文注释：单词摸底的简化实现，包含回合数选择、倒计时与首个符合条件单词判定

type RoundOptions = 5 | 8 | 10 | 12;

interface WordTestRoundConfig {
  prefix: string;
  minLength: number;
}

interface WordTestData {
  roundsTotal: RoundOptions;
  currentRound: number;
  currentConfig?: WordTestRoundConfig;
  winnerDeclared?: boolean;
  /** 最近 N 轮使用的 config 的 key（prefix_minLen），用于避免题目重复 */
  recentConfigKeys?: string[];
  /** 用户答对题数，key 为 String(userId) */
  userScores?: Record<string, number>;
  /** 用户展示名（@username 或姓名），key 为 String(userId) */
  userNames?: Record<string, string>;
}

const COUNTDOWN_MS = 30_000;
const GAP_BEFORE_NEXT_ROUND_MS = 10_000;
const RECENT_CONFIG_CAP = 6; // 至少与最近 6 轮不重复

const ALL_PREFIXES = ['re', 'co', 'in', 'de', 'pro', 'sub', 'pre', 'un', 'dis', 'con', 'com', 'ex', 'anti', 'over', 'under'];
const MIN_LENGTHS = [5, 6, 7, 8];

function configKey(cfg: WordTestRoundConfig): string {
  return `${cfg.prefix}_${cfg.minLength}`;
}

function randomRoundConfig(recentKeys: string[] = []): WordTestRoundConfig {
  const candidates: WordTestRoundConfig[] = [];
  for (const prefix of ALL_PREFIXES) {
    for (const minLength of MIN_LENGTHS) {
      const key = `${prefix}_${minLength}`;
      if (!recentKeys.includes(key)) candidates.push({ prefix, minLength });
    }
  }
  if (candidates.length === 0) {
    const prefix = ALL_PREFIXES[Math.floor(Math.random() * ALL_PREFIXES.length)];
    const minLength = MIN_LENGTHS[Math.floor(Math.random() * MIN_LENGTHS.length)];
    return { prefix, minLength };
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function validateWord(word: string, config: WordTestRoundConfig): boolean {
  const lower = word.toLowerCase();
  if (!/^[a-zA-Z]+$/.test(lower)) return false;
  if (!lower.startsWith(config.prefix)) return false;
  if (lower.length < config.minLength) return false;
  return true;
}

/** 根据 userScores 生成排名文案（按答对题数降序），无数据时返回 rankingNobody */
function buildRankingMessage(data: WordTestData, t: ReturnType<typeof getTexts>): string {
  const scores = data.userScores || {};
  const names = data.userNames || {};
  const entries = Object.entries(scores)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const lines = entries.map(([userId, count]) =>
    t.wordTest.rankingLine(names[userId] || `User ${userId}`, count),
  );
  const body = lines.length ? lines.join('\n') : t.wordTest.rankingNobody;
  return `${t.wordTest.rankingTitle}\n${body}`;
}

export function registerWordTest(bot: Telegraf<Context>) {
  // 入口：主菜单按钮
  bot.action('start_word_test', async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        const lang = await getChatLanguage(ctx.chat?.id ?? 0);
        await ctx.reply(getTexts(lang).common.onlyGroups);
        return;
      }

      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      const state = await getOrCreateChatState(chatId);

      if (state.currentGame && state.currentGame !== 'word_test') {
        await ctx.reply(t.common.otherGameRunning);
        return;
      }

      await setChatState(chatId, {
        currentGame: 'word_test',
        phase: 'idle',
        data: {
          ...state.data,
        },
      });

      // 先把介绍消息上的按键清掉，避免叠加
      try {
        await ctx.editMessageReplyMarkup(undefined);
      } catch {
        // ignore
      }

      await ctx.telegram.sendMessage(
        chatId,
        t.wordTest.chooseRounds,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '5', callback_data: 'word_test_rounds_5' },
                { text: '8', callback_data: 'word_test_rounds_8' },
              ],
              [
                { text: '10', callback_data: 'word_test_rounds_10' },
                { text: '12', callback_data: 'word_test_rounds_12' },
              ],
              // 底部：返回主菜单
              [{ text: t.i18n.back, callback_data: 'back_to_menu' }],
            ],
          },
        },
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('单词摸底入口异常', err);
    }
  });

  // 回合数选择
  bot.action(/^word_test_rounds_(5|8|10|12)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();

      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return;
      }

      const chatId = ctx.chat.id;
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'word_test') return;

      const rounds = Number(ctx.match[1]) as RoundOptions;
      const data: WordTestData = {
        roundsTotal: rounds,
        currentRound: 0,
      };

      await setChatState(chatId, {
        phase: 'in_game',
        data: {
          ...state.data,
          wordTest: data,
        },
      });

      await startNextRound(bot, chatId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('单词摸底回合数选择异常', err);
    }
  });

  // 监听群内文本，用于抢答
  bot.on('text', async (ctx, next) => {
    try {
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return next();
      }
      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'word_test' || state.phase !== 'in_game') {
        return next();
      }

      const data = (state.data['wordTest'] || {}) as WordTestData;
      if (!data.currentConfig || data.winnerDeclared) {
        return next();
      }

      const text = 'text' in ctx.message ? ctx.message.text : undefined;
      if (!text || !ctx.from) return next();

      const word = text.trim();
      if (!validateWord(word, data.currentConfig)) {
        return next();
      }

      // 首个符合条件者获胜，记录答对题数
      data.winnerDeclared = true;
      const userId = String(ctx.from.id);
      data.userScores = data.userScores || {};
      data.userNames = data.userNames || {};
      data.userScores[userId] = (data.userScores[userId] || 0) + 1;
      data.userNames[userId] = ctx.from.username
        ? `@${ctx.from.username}`
        : (ctx.from.first_name || ctx.from.last_name || '?');
      await setChatState(chatId, {
        data: {
          ...state.data,
          wordTest: data,
        },
      });

      const displayName = data.userNames[userId];
      await ctx.reply(t.wordTest.winner(displayName, word));

      // 有人答对即结束本回合：清除本回合所有定时器；若是最后一回合则直接结束游戏，否则提示 10s 后下一回合
      const round = data.currentRound;
      clearChatTimeout(chatId, `word_test_round_${round}_10s`);
      clearChatTimeout(chatId, `word_test_round_${round}_5s`);
      clearChatTimeout(chatId, `word_test_round_${round}_end`);
      if (round >= data.roundsTotal) {
        await ctx.telegram.sendMessage(chatId, buildRankingMessage(data, t));
        await ctx.telegram.sendMessage(chatId, t.wordTest.finished, {
          reply_markup: withGrowthButtons(t).reply_markup,
        });
        await resetChatState(chatId);
      } else {
        await ctx.telegram.sendMessage(chatId, t.wordTest.nextRoundIn10s);
        setChatTimeout(chatId, `word_test_round_${round}_gap_5s`, async () => {
          const texts = getTexts(await getChatLanguage(chatId));
          await bot.telegram.sendMessage(chatId, texts.wordTest.nextRoundIn5s);
        }, 5_000);
        setChatTimeout(chatId, `word_test_round_${round}_next`, () => {
          startNextRound(bot, chatId).catch((err) =>
            // eslint-disable-next-line no-console
            console.error('单词摸底下一回合异常', err),
          );
        }, GAP_BEFORE_NEXT_ROUND_MS);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('单词摸底文本处理异常', err);
    }

    return next();
  });
}

async function startNextRound(bot: Telegraf<Context>, chatId: number) {
  const t = getTexts(await getChatLanguage(chatId));
  const state = await getOrCreateChatState(chatId);
  const data = (state.data['wordTest'] || {}) as WordTestData;
  if (data.currentRound >= data.roundsTotal) {
    await bot.telegram.sendMessage(chatId, buildRankingMessage(data, t));
    await bot.telegram.sendMessage(chatId, t.wordTest.finished, {
      reply_markup: withGrowthButtons(t).reply_markup,
    });
    await resetChatState(chatId);
    return;
  }

  data.currentRound += 1;
  data.winnerDeclared = false;
  data.recentConfigKeys = data.recentConfigKeys || [];
  data.currentConfig = randomRoundConfig(data.recentConfigKeys);
  const cfgKey = data.currentConfig ? configKey(data.currentConfig) : '';
  if (cfgKey) {
    data.recentConfigKeys = [cfgKey, ...data.recentConfigKeys].slice(0, RECENT_CONFIG_CAP);
  }

  await setChatState(chatId, {
    data: {
      ...state.data,
      wordTest: data,
    },
  });

  const cfg = data.currentConfig;
  await bot.telegram.sendMessage(
    chatId,
    t.wordTest.roundPrompt(data.currentRound, data.roundsTotal, cfg.prefix, cfg.minLength),
  );

  // 倒计时提示
  setChatTimeout(chatId, `word_test_round_${data.currentRound}_10s`, async () => {
    await bot.telegram.sendMessage(chatId, t.wordTest.hint10s);
  }, COUNTDOWN_MS - 10_000);

  setChatTimeout(chatId, `word_test_round_${data.currentRound}_5s`, async () => {
    await bot.telegram.sendMessage(chatId, t.wordTest.hint5s);
  }, COUNTDOWN_MS - 5_000);

  setChatTimeout(chatId, `word_test_round_${data.currentRound}_end`, async () => {
    try {
      const latestState = await getOrCreateChatState(chatId);
      const latestData = (latestState.data['wordTest'] || {}) as WordTestData;
      const winnerDeclared = latestData.winnerDeclared;

      if (!winnerDeclared) {
        await bot.telegram.sendMessage(chatId, t.wordTest.timeoutNoWinner);
      }
      // 若是最后一回合则直接结束游戏，先发排名再发结束，不再发「下一回合」倒计时
      if (data.currentRound >= data.roundsTotal) {
        const latestData = (latestState.data['wordTest'] || {}) as WordTestData;
        await bot.telegram.sendMessage(chatId, buildRankingMessage(latestData, t));
        await bot.telegram.sendMessage(chatId, t.wordTest.finished, {
          reply_markup: withGrowthButtons(t).reply_markup,
        });
        await resetChatState(chatId);
      } else {
        await bot.telegram.sendMessage(chatId, t.wordTest.nextRoundIn10s);
        setChatTimeout(chatId, `word_test_round_${data.currentRound}_gap_5s`, async () => {
          await bot.telegram.sendMessage(chatId, t.wordTest.nextRoundIn5s);
        }, 5_000);
        setChatTimeout(chatId, `word_test_round_${data.currentRound}_next`, () => {
          startNextRound(bot, chatId).catch((err) =>
            // eslint-disable-next-line no-console
            console.error('单词摸底下一回合异常', err),
          );
        }, GAP_BEFORE_NEXT_ROUND_MS);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('单词摸底回合结束处理异常', err);
    }
  }, COUNTDOWN_MS);
}

