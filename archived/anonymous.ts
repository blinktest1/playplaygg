import { Context, Markup, Telegraf } from 'telegraf';
import { getChatLanguage, getOrCreateChatState, setChatState, resetChatState } from '../state';
import { withGrowthButtons } from '../growth';
import { getTexts } from '../i18n';

// 中文注释：匿名信功能，实现话题选择、深链报名和匿名转发

interface AnonymousData {
  chatId: number;
  topic: string;
}

export function registerAnonymous(bot: Telegraf<Context>) {
  bot.action('start_anonymous', async (ctx) => {
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
      if (state.currentGame && state.currentGame !== 'anonymous') {
        await ctx.reply(t.common.otherGameRunning);
        return;
      }

      await setChatState(chatId, {
        currentGame: 'anonymous',
        phase: 'idle',
      });

      // 清除介绍消息上的按键
      try {
        await ctx.editMessageReplyMarkup(undefined);
      } catch {
        // ignore
      }

      await ctx.telegram.sendMessage(
        chatId,
        t.anonymous.chooseTopic,
        Markup.inlineKeyboard([
          [
            Markup.button.callback(t.anonymous.topicRel, 'anon_topic_rel'),
            Markup.button.callback(t.anonymous.topicJob, 'anon_topic_job'),
          ],
          [
            Markup.button.callback(t.anonymous.topicFriend, 'anon_topic_friend'),
            Markup.button.callback(t.anonymous.topicCustom, 'anon_topic_custom'),
          ],
        ]),
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('匿名信入口异常', err);
    }
  });

  bot.action(/^anon_topic_(rel|job|friend)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return;
      }
      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      const key = ctx.match[1];
      let topic = '';
      if (key === 'rel') topic = t.anonymous.topicRel;
      if (key === 'job') topic = t.anonymous.topicJob;
      if (key === 'friend') topic = t.anonymous.topicFriend;

      await setupAnonymousTopic(bot, chatId, topic);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('匿名信预设话题异常', err);
    }
  });

  bot.action('anon_topic_custom', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return;
      }
      const chatId = ctx.chat.id;
      const t = getTexts(await getChatLanguage(chatId));
      await setChatState(chatId, {
        phase: 'waiting_players',
        data: {
          customTopicChatId: chatId,
        },
      });
      await ctx.reply(
        t.anonymous.askCustomTopic,
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('匿名信自定义话题入口异常', err);
    }
  });

  // 自定义话题文本输入（仅在刚刚点击“自定义话题”后的一条文本）
  bot.on('text', async (ctx, next) => {
    try {
      if (!ctx.chat || (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup')) {
        return next();
      }
      const chatId = ctx.chat.id;
      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'anonymous' || state.phase !== 'waiting_players') {
        return next();
      }

      const text = 'text' in ctx.message ? ctx.message.text : undefined;
      if (!text) return next();

      await setupAnonymousTopic(bot, chatId, text.trim());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('匿名信自定义话题文本异常', err);
    }

    return next();
  });

  // 私聊中发送匿名内容：/start anon_<chatId> 之后的任意文本
  bot.start(async (ctx) => {
    const payload = ctx.startPayload;
    if (!payload || !payload.startsWith('anon_')) {
      return;
    }

    try {
      const chatId = Number(payload.replace('anon_', ''));
      const lang = Number.isFinite(chatId) ? await getChatLanguage(chatId) : 'ru';
      const t = getTexts(lang);
      if (!Number.isFinite(chatId)) {
        await ctx.reply(t.anonymous.invalidLink);
        return;
      }

      const state = await getOrCreateChatState(chatId);
      if (state.currentGame !== 'anonymous') {
        await ctx.reply(t.anonymous.notActive);
        return;
      }

      const data = (state.data['anonymous'] || {}) as AnonymousData;
      const topic = data.topic || 'Анонимное письмо';

      await ctx.reply(t.anonymous.privateIntro(topic));

      // 标记此私聊会话对应的群组（Telegraf Context 无内置 session，通过扩展挂载）
      const session = (ctx as any).session ?? {};
      (ctx as any).session = {
        ...session,
        anonTargetChatId: chatId,
        anonTopic: topic,
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('匿名信 /start anon 处理异常', err);
    }
  });

  // 私聊文本转发到群
  bot.on('text', async (ctx, next) => {
    try {
      if (ctx.chat?.type === 'private') {
        const s: any = (ctx as any).session;
        const targetChatId = s?.anonTargetChatId;
        const topic = s?.anonTopic || 'Anonymous';

        if (targetChatId && 'text' in ctx.message) {
          const t = getTexts(await getChatLanguage(targetChatId));
          const text = ctx.message.text;
          await ctx.telegram.sendMessage(
            targetChatId,
            t.anonymous.forwarded(topic, text),
            {
              reply_markup: withGrowthButtons(t).reply_markup,
            },
          );
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('匿名信私聊文本转发异常', err);
    }

    return next();
  });
}

async function setupAnonymousTopic(bot: Telegraf<Context>, chatId: number, topic: string) {
  const state = await getOrCreateChatState(chatId);
  const t = getTexts(await getChatLanguage(chatId));
  const data: AnonymousData = {
    chatId,
    topic,
  };

  await setChatState(chatId, {
    currentGame: 'anonymous',
    phase: 'in_game',
    data: {
      ...state.data,
      anonymous: data,
    },
  });

  const botInfo = await bot.telegram.getMe();
  const deepLink = `https://t.me/${botInfo.username}?start=anon_${chatId}`;

  await bot.telegram.sendMessage(
    chatId,
    t.anonymous.groupTopicLink(topic, deepLink),
  );
}

