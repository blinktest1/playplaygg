import type { LanguageCode } from '../state';

export const PRIVATE_START_MSG: Record<LanguageCode, string> = {
  en: `🎮 <b>Spy Me</b> — Party games for your group!

🕵️ Undercover
🎯 Truth or Dare
📝 Anonymous Wall

Add me to a group and send <b>/play</b> to start!`,

  ru: `🎮 <b>Spy Me</b> — Групповые игры для вашего чата!

🕵️ Кто шпион
🎯 Правда или Действие
📝 Анонимная стена

Добавь меня в группу и отправь <b>/play</b>!`,

  zh: `🎮 <b>Spy Me</b> — 群组派对游戏！

🕵️ 谁是卧底
🎯 真心话大冒险
📝 匿名大字报

拉我进群，发 <b>/play</b> 即可开玩！`,
};

const FALLBACK: LanguageCode = 'ru';

export function getPrivateStartMsg(lang: LanguageCode): string {
  return PRIVATE_START_MSG[lang] ?? PRIVATE_START_MSG[FALLBACK];
}
