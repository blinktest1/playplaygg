import type { LanguageCode } from '../state';

export const WELCOME_PINNED_MSG: Record<LanguageCode, string> = {
  ru: `🎮 <b>Добро пожаловать в @Blink_AIgames_bot!</b>

Хотите мгновенно зажечь в своем сообществе? 🔥 Просто пригласите меня в группу и наберите <b>/play</b>, чтобы сразу же начать веселую вечеринку! 🎲✨


─────── ✦ ───────


🚀 <b>Душевные знакомства:</b> @Blink_AImatch_Bot`,

  zh: `🎮 <b>欢迎来到 @Blink_AIgames_bot 游戏乐园！</b>

想让你的社区瞬间燥起来吗？🔥 只需把我邀请进群，发送 <b>/play</b> 即可立刻开启派对狂欢！🎲✨


─────── ✦ ───────


🚀 <b>灵魂交友:</b> @Blink_AImatch_Bot`,

  en: `🎮 <b>Welcome to @Blink_AIgames_bot!</b>

Want to hype up your community instantly? 🔥 Just invite me to the group and type <b>/play</b> to start the party right away! 🎲✨


─────── ✦ ───────


🚀 <b>Soul Match:</b> @Blink_AImatch_Bot`,
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
