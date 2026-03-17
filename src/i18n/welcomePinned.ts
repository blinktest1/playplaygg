import type { LanguageCode } from '../state';

export const WELCOME_PINNED_MSG: Record<LanguageCode, string> = {
  ru: `🎮 <b>Добро пожаловать в игровой парк @playplayggbot!</b>

Хотите мгновенно зажечь в своем сообществе? 🔥 Просто пригласите меня в группу и наберите <b>/playgg</b>, чтобы сразу же начать веселую вечеринку! 🎲✨


─────── ✦ ───────


Партнеры:

🚀 <b>Душевные знакомства:</b> @Blink_AImatch_Bot

💬 <b>AI-подруга:</b> @KissMe_AI_Bot

🎨 <b>Хардкорная графика:</b> @DreamAIGCBot

✨ <b>Удобное создание изображений:</b> @KissMeStudioBot`,

  zh: `🎮 <b>欢迎来到 @playplayggbot 游戏乐园！</b>

想让你的社区瞬间燥起来吗？🔥 只需把我邀请进群，发送 <b>/playgg</b> 即可立刻开启派对狂欢！🎲✨


─────── ✦ ───────


合作伙伴:

🚀 <b>灵魂交友:</b> @Blink_AImatch_Bot

💬 <b>AI 女友:</b> @KissMe_AI_Bot

🎨 <b>硬核制图:</b> @DreamAIGCBot

✨ <b>便捷生图:</b> @KissMeStudioBot`,

  en: `🎮 <b>Welcome to the @playplayggbot Gaming Hub!</b>

Want to hype up your community instantly? 🔥 Just invite me to the group and type <b>/playgg</b> to start the party right away! 🎲✨


─────── ✦ ───────


Our Partners:

🚀 <b>Soul Match:</b> @Blink_AImatch_Bot

💬 <b>AI Companion:</b> @KissMe_AI_Bot

🎨 <b>Pro Image Gen:</b> @DreamAIGCBot

✨ <b>Easy Art Creator:</b> @KissMeStudioBot`,
};

const FALLBACK_LANG: LanguageCode = 'ru';

export function resolveLangFromTelegram(languageCode?: string | null): LanguageCode {
  if (!languageCode || typeof languageCode !== 'string') return FALLBACK_LANG;
  const lower = languageCode.toLowerCase();
  const map: Record<string, LanguageCode> = {
    ru: 'ru',
    en: 'en',
    zh: 'zh',
    'zh-hans': 'zh',
    'zh-cn': 'zh',
    'zh-tw': 'zh',
  };
  return map[lower] ?? FALLBACK_LANG;
}

export function getWelcomePinnedMsg(lang: LanguageCode): string {
  return WELCOME_PINNED_MSG[lang] ?? WELCOME_PINNED_MSG[FALLBACK_LANG];
}
