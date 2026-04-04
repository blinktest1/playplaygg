import type { LanguageCode } from '../state';

export const WELCOME_PINNED_MSG: Record<LanguageCode, string> = {
  en: `🎮 <b>Spy Me</b> is here! Send <b>/play</b> to start a game.

🕵️ Undercover · 🎯 Truth or Dare · 📝 Anonymous Wall`,

  ru: `🎮 <b>Spy Me</b> в чате! Отправь <b>/play</b>, чтобы начать.

🕵️ Кто шпион · 🎯 Правда или Действие · 📝 Анонимная стена`,

  zh: `🎮 <b>Spy Me</b> 已加入！发送 <b>/play</b> 开始游戏。

🕵️ 谁是卧底 · 🎯 真心话大冒险 · 📝 匿名大字报`,
};

const FALLBACK_LANG: LanguageCode = 'en';

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
