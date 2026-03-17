import { Context, Telegraf } from 'telegraf';
import {
  getChatLanguage,
  getOrCreateChatState,
  setChatState,
  setChatTimeout,
  clearAllChatTimers,
  resetChatState,
} from '../state';
import { withGrowthButtons } from '../growth';
import { getTexts } from '../i18n';
import { tryAcquireRoom, releaseRoom, getChatRoomUsage } from '../roomQuota';

// 中文注释：单词炸弹接龙的简化实现，包含报名、回合数选择与超时淘汰

type WordBombRounds = 4 | 6 | 8 | 10;

interface BombPlayer {
  userId: number;
  name: string;
  alive: boolean;
}

interface WordBombData {
  roundsTotal: WordBombRounds;
  currentRound: number;
  players: BombPlayer[];
  currentIndex: number;
  lastWord: string;
}

const MAX_PLAYERS = 8;

export function registerWordBomb(bot: Telegraf<Context>) {
  bot.action('start_word_bomb', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        const lang = await getChatLanguage(ctx.chat?.id ?? 0);
        await ctx.reply(getTexts(lang).common.onlyGroups);
        return;
      }

      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      if (!(await tryAcquireRoom(chatId, 'word_bomb'))) {
        const usage = await getChatRoomUsage(chatId);
        await ctx.reply(t.common.roomFull(usage.used, usage.max));
        return;
      }
      const state = await getOrCreateChatState(chatId);
      await setChatState(chatId, {
        currentGame: 'word_bomb',
        phase: 'idle',
        data: {
          ...state.data,
        },
      });

      // 清除介绍消息上的按键
      try {
        await ctx.editMessageReplyMarkup(undefined);
      } catch {
        // ignore
      }

      await ctx.telegram.sendMessage(
        chatId,
        t.wordBomb.chooseRounds,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '4', callback_data: 'word_bomb_rounds_4' },
                { text: '6', callback_data: 'word_bomb_rounds_6' },
              ],
              [
                { text: '8', callback_data: 'word_bomb_rounds_8' },
                { text: '10', callback_data: 'word_bomb_rounds_10' },
              ],
              // 底部：返回主菜单
              [{ text: t.i18n.back, callback_data: 'back_to_menu' }],
            ],
          },
        },
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('单词炸弹入口异常', err);
    }
  });

  bot.action(/^word_bomb_rounds_(4|6|8|10)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return;
      }
      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'word_bomb') return;

      const rounds = Number(ctx.match[1]) as WordBombRounds;
      const data: Partial<WordBombData> = {
        roundsTotal: rounds,
        currentRound: 0,
        players: [],
        currentIndex: 0,
        lastWord: '',
      };

      await setChatState(chatId, {
        phase: 'waiting_players',
        data: {
          ...state.data,
          wordBomb: data,
        },
      });

      await ctx.reply(
        t.wordBomb.joinOpen,
      );

      setChatTimeout(chatId, 'word_bomb_start', () => {
        startWordBombGame(bot, chatId).catch((err) =>
          // eslint-disable-next-line no-console
          console.error('单词炸弹开始异常', err),
        );
      }, 25_000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('单词炸弹回合数选择异常', err);
    }
  });

  // 报名：在等待阶段发送任意消息即视为报名
  bot.on('text', async (ctx, next) => {
    try {
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return next();
      }
      const chatId = ctx.chat.id;
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'word_bomb' || state.phase !== 'waiting_players') {
        return next();
      }
      const from = ctx.from;
      if (!from) return next();

      const data = (state.data['wordBomb'] || {
        players: [],
      }) as WordBombData;

      if (!data.players) data.players = [];
      if (data.players.find((p) => p.userId === from.id)) {
        return next();
      }
      if (data.players.length >= MAX_PLAYERS) {
        return next();
      }

      data.players.push({
        userId: from.id,
        name: from.first_name,
        alive: true,
      });

      await setChatState(chatId, {
        data: {
          ...state.data,
          wordBomb: data,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('单词炸弹报名异常', err);
    }

    return next();
  });

  // 接龙阶段：监听文本
  bot.on('text', async (ctx, next) => {
    try {
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return next();
      }
      const chatId = ctx.chat.id;
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'word_bomb' || state.phase !== 'in_game') {
        return next();
      }
      const from = ctx.from;
      if (!from) return next();
      const text = 'text' in ctx.message ? ctx.message.text : undefined;
      if (!text) return next();

      const data = (state.data['wordBomb'] || {}) as WordBombData;
      const players = data.players || [];
      const currentPlayer = players[data.currentIndex];
      if (!currentPlayer || !currentPlayer.alive || currentPlayer.userId !== from.id) {
        return next();
      }

      const word = text.trim();
      if (!/^[a-zA-Z]+$/.test(word)) return next();

      if (data.lastWord) {
        const lastChar = data.lastWord[data.lastWord.length - 1].toLowerCase();
        const firstChar = word[0].toLowerCase();
        if (lastChar !== firstChar) {
          await ctx.reply(
            getTexts(await getChatLanguage(chatId)).wordBomb.mustStartWith(lastChar.toUpperCase()),
          );
          return next();
        }
      }

      // 合法接龙
      data.lastWord = word;
      // 清理当前玩家的超时计时器
      clearAllChatTimers(chatId);

      // 进入下一个玩家
      await advanceWordBombTurn(bot, chatId, data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('单词炸弹文本处理异常', err);
    }

    return next();
  });
}

async function startWordBombGame(bot: Telegraf<Context>, chatId: number) {
  const t = getTexts(await getChatLanguage(chatId));
  const state = await getOrCreateChatState(chatId);
  const data = (state.data['wordBomb'] || {}) as WordBombData;
  const players = (data.players || []).filter((p) => p.alive !== false);

  if (players.length === 0) {
    await bot.telegram.sendMessage(chatId, t.wordBomb.notEnoughPlayers);
    await resetChatState(chatId);
    await releaseRoom(chatId, 'word_bomb');
    return;
  }

  data.players = players;
  data.currentRound = 1;
  data.currentIndex = 0;
  data.lastWord = randomStartWord();

  await setChatState(chatId, {
    phase: 'in_game',
    data: {
      ...state.data,
      wordBomb: data,
    },
  });

  await bot.telegram.sendMessage(
    chatId,
    t.wordBomb.roundStart(
      1,
      data.roundsTotal,
      players.map((p, idx) => (idx === 0 ? `📍${p.name}` : p.name)).join(' > '),
      data.lastWord,
    ),
  );

  schedulePlayerTimeout(bot, chatId, data);
}

async function advanceWordBombTurn(bot: Telegraf<Context>, chatId: number, data: WordBombData) {
  const t = getTexts(await getChatLanguage(chatId));
  const players = data.players.filter((p) => p.alive);
  if (players.length <= 1) {
    // 游戏结束
    const winner = players[0];
    bot.telegram
      .sendMessage(
        chatId,
        winner
          ? t.wordBomb.gameOverWinner(winner.name)
          : t.wordBomb.gameOverNoWinner,
        {
          reply_markup: withGrowthButtons(t).reply_markup,
        },
      )
      .catch((err) => console.error('单词炸弹结束消息异常', err));
    await resetChatState(chatId);
    await releaseRoom(chatId, 'word_bomb');
    return;
  }

  const state = await getOrCreateChatState(chatId);
  data.currentIndex = (data.currentIndex + 1) % data.players.length;

  await setChatState(chatId, {
    data: {
      ...state.data,
      wordBomb: data,
    },
  });

  void schedulePlayerTimeout(bot, chatId, data);
}

async function schedulePlayerTimeout(bot: Telegraf<Context>, chatId: number, data: WordBombData) {
  const t = getTexts(await getChatLanguage(chatId));
  const currentPlayer = data.players[data.currentIndex];
  if (!currentPlayer || !currentPlayer.alive) {
    await advanceWordBombTurn(bot, chatId, data);
    return;
  }

  bot.telegram
    .sendMessage(
      chatId,
      t.wordBomb.turnPrompt(currentPlayer.name),
    )
    .catch((err) => console.error('单词炸弹提示异常', err));

  setChatTimeout(
    chatId,
    `word_bomb_turn_${currentPlayer.userId}`,
    async () => {
      // 超时淘汰
      currentPlayer.alive = false;
      await bot.telegram.sendMessage(
        chatId,
        t.wordBomb.timeoutOut(currentPlayer.name),
      );
      void advanceWordBombTurn(bot, chatId, data);
    },
    6_000,
  );
}

function randomStartWord(): string {
  const words = ['start', 'game', 'bomb', 'relay', 'music', 'focus', 'light'];
  return words[Math.floor(Math.random() * words.length)];
}

