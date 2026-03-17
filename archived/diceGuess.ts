import { Context, Telegraf } from 'telegraf';
import { getChatLanguage, getOrCreateChatState, setChatState, setChatTimeout, resetChatState } from '../state';
import { withGrowthButtons } from '../growth';
import { getTexts } from '../i18n';
import { tryAcquireRoom, releaseRoom, getChatRoomUsage } from '../roomQuota';

// 中文注释：有多少（掷骰子猜点数）的简化实现，包含报名、下注和积分结算

type DiceRounds = 8 | 12 | 16;

type DiceBetType = 'zone1' | 'zone2' | 'single';

interface DicePlayer {
  userId: number;
  name: string;
  score: number;
  bet?: {
    type: DiceBetType;
    value: string;
    stake: number;
  };
}

interface DiceGameData {
  roundsTotal: DiceRounds;
  currentRound: number;
  players: DicePlayer[];
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

export function registerDiceGuess(bot: Telegraf<Context>) {
  bot.action('start_dice_guess', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        const lang = await getChatLanguage(ctx.chat?.id ?? 0);
        await ctx.reply(getTexts(lang).common.onlyGroups);
        return;
      }

      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      if (!(await tryAcquireRoom(chatId, 'dice_guess'))) {
        const usage = await getChatRoomUsage(chatId);
        await ctx.reply(t.common.roomFull(usage.used, usage.max));
        return;
      }
      const state = await getOrCreateChatState(chatId);
      await setChatState(chatId, {
        currentGame: 'dice_guess',
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
        t.dice.chooseRounds,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '8', callback_data: 'dice_rounds_8' },
                { text: '12', callback_data: 'dice_rounds_12' },
              ],
              [{ text: '16', callback_data: 'dice_rounds_16' }],
              // 底部：返回主菜单
              [{ text: t.i18n.back, callback_data: 'back_to_menu' }],
            ],
          },
        },
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('有多少入口异常', err);
    }
  });

  bot.action(/^dice_rounds_(8|12|16)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return;
      }
      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'dice_guess') return;

      const rounds = Number(ctx.match[1]) as DiceRounds;
      const data: DiceGameData = {
        roundsTotal: rounds,
        currentRound: 0,
        players: [],
      };

      await setChatState(chatId, {
        phase: 'waiting_players',
        data: {
          ...state.data,
          diceGame: data,
        },
      });

      await ctx.reply(
        t.dice.joinOpen,
      );

      setChatTimeout(chatId, 'dice_start', () => {
        startDiceGame(bot, chatId).catch((err) =>
          // eslint-disable-next-line no-console
          console.error('有多少开始异常', err),
        );
      }, 20_000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('有多少回合数选择异常', err);
    }
  });

  // 报名：等待阶段发送任何消息
  bot.on('text', async (ctx, next) => {
    try {
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return next();
      }
      const chatId = ctx.chat.id;
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'dice_guess' || state.phase !== 'waiting_players') {
        return next();
      }
      const from = ctx.from;
      if (!from) return next();

      const data = (state.data['diceGame'] || { players: [] }) as DiceGameData;
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
        score: 20,
      });

      await setChatState(chatId, {
        data: {
          ...state.data,
          diceGame: data,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('有多少报名异常', err);
    }

    return next();
  });

  // 下注按钮处理
  bot.action(/^dice_bet_(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return;
      }
      const chatId = ctx.chat.id;
      const from = ctx.from;
      if (!from) return;

      const betCode = ctx.match[1]; // 例如 zone1_135, zone2_24, single_3
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'dice_guess' || state.phase !== 'in_game') {
        return;
      }

      const data = (state.data['diceGame'] || {}) as DiceGameData;
      const player = data.players.find((p) => p.userId === from.id);
      if (!player) {
        await ctx.reply(getTexts(await getChatLanguage(chatId)).dice.notInGame);
        return;
      }

      const [type, value] = betCode.split('_');
      let stake = 1;
      if (type === 'zone2') stake = 2;
      if (type === 'single') stake = 3;

      if (player.score < stake) {
        await ctx.reply(getTexts(await getChatLanguage(chatId)).dice.notEnoughScore);
        return;
      }

      player.bet = {
        type: type as DiceBetType,
        value,
        stake,
      };

      await setChatState(chatId, {
        data: {
          ...state.data,
          diceGame: data,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('有多少下注异常', err);
    }
  });
}

async function startDiceGame(bot: Telegraf<Context>, chatId: number) {
  const t = getTexts(await getChatLanguage(chatId));
  const state = await getOrCreateChatState(chatId);
  const data = (state.data['diceGame'] || {}) as DiceGameData;
  const players = data.players || [];

  if (players.length < MIN_PLAYERS) {
    await bot.telegram.sendMessage(chatId, t.dice.notEnoughPlayers);
    await resetChatState(chatId);
    await releaseRoom(chatId, 'dice_guess');
    return;
  }

  data.currentRound = 0;
  await setChatState(chatId, {
    phase: 'in_game',
    data: {
      ...state.data,
      diceGame: data,
    },
  });

  await bot.telegram.sendMessage(chatId, t.dice.gameStart);
  await startNextDiceRound(bot, chatId);
}

async function startNextDiceRound(bot: Telegraf<Context>, chatId: number) {
  const t = getTexts(await getChatLanguage(chatId));
  const state = await getOrCreateChatState(chatId);
  const data = (state.data['diceGame'] || {}) as DiceGameData;

  if (data.currentRound >= data.roundsTotal) {
    const ranking = [...data.players].sort((a, b) => b.score - a.score);
    const rankingLines = ranking.map((p, idx) => `${idx + 1}. ${p.name}: ${p.score}`).join('\n');
    const text = t.dice.gameFinishedRanking(rankingLines);

    await bot.telegram.sendMessage(chatId, text, {
      reply_markup: withGrowthButtons(t).reply_markup,
    });
    await resetChatState(chatId);
    await releaseRoom(chatId, 'dice_guess');
    return;
  }

  data.currentRound += 1;
  data.players.forEach((p) => {
    p.bet = undefined;
  });

  await setChatState(chatId, {
    data: {
      ...state.data,
      diceGame: data,
    },
  });

  await bot.telegram.sendMessage(
    chatId,
    t.dice.roundBetPrompt(data.currentRound, data.roundsTotal),
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '1/3/5', callback_data: 'dice_bet_zone1_135' },
            { text: '2/4/6', callback_data: 'dice_bet_zone1_246' },
          ],
          [
            { text: '1/3', callback_data: 'dice_bet_zone2_13' },
            { text: '2/5', callback_data: 'dice_bet_zone2_25' },
            { text: '4/6', callback_data: 'dice_bet_zone2_46' },
          ],
          [
            { text: '1', callback_data: 'dice_bet_single_1' },
            { text: '2', callback_data: 'dice_bet_single_2' },
            { text: '3', callback_data: 'dice_bet_single_3' },
            { text: '4', callback_data: 'dice_bet_single_4' },
            { text: '5', callback_data: 'dice_bet_single_5' },
            { text: '6', callback_data: 'dice_bet_single_6' },
          ],
        ],
      },
    },
  );

  // 简化：3 秒后开奖
  setChatTimeout(chatId, `dice_round_${data.currentRound}_roll`, async () => {
    await settleDiceRound(bot, chatId);
  }, 3_000);
}

async function settleDiceRound(bot: Telegraf<Context>, chatId: number) {
  const t = getTexts(await getChatLanguage(chatId));
  const state = await getOrCreateChatState(chatId);
  const data = (state.data['diceGame'] || {}) as DiceGameData;
  const die = 1 + Math.floor(Math.random() * 6);

  // 结算
  for (const player of data.players) {
    if (!player.bet) continue;
    const { type, value, stake } = player.bet;
    let win = false;

    if (type === 'zone1') {
      const digits = value.split('').map((v) => Number(v));
      win = digits.includes(die);
    } else if (type === 'zone2') {
      const digits = value.split('').map((v) => Number(v));
      win = digits.includes(die);
    } else if (type === 'single') {
      win = Number(value) === die;
    }

    if (win) {
      player.score += stake;
    } else {
      player.score -= stake;
    }
  }

  await setChatState(chatId, {
    data: {
      ...state.data,
      diceGame: data,
    },
  });

  const ranking = [...data.players].sort((a, b) => b.score - a.score);
  const rankingLines = ranking.map((p, idx) => `${idx + 1}. ${p.name}: ${p.score}`).join('\n');
  const text = t.dice.rollResultRanking(die, rankingLines);

  await bot.telegram.sendMessage(chatId, text);

  setChatTimeout(chatId, `dice_round_${data.currentRound}_next`, () => {
    startNextDiceRound(bot, chatId).catch((err) =>
      // eslint-disable-next-line no-console
      console.error('有多少下一回合异常', err),
    );
  }, 2_000);
}

