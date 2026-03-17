import type { LanguageCode } from '../state';
import { resolveLangFromTelegram } from './welcomePinned';

export const PRIVATE_START_MSG: Record<LanguageCode, string> = {
  ru: `👋 <b>Добро пожаловать в PlayPlayGG!</b> Я ваш личный администратор групповых игр.

Добавьте меня в свою группу и наберите <b>/playgg</b>, чтобы начать вечеринку! 🎉


🚀 <b>Душевные знакомства:</b> @Blink_AImatch_Bot`,

  zh: `👋 <b>欢迎来到 PlayPlayGG！</b> 我是您的专属群组游戏管理员。

将我邀请进群并发送 <b>/playgg</b> 即可开启派对狂欢！ 🎉


🚀 <b>灵魂交友:</b> @Blink_AImatch_Bot`,

  en: `👋 <b>Welcome to PlayPlayGG!</b> I am your personal group games administrator.

Add me to your group and type <b>/playgg</b> to start the party! 🎉


🚀 <b>Soul Match:</b> @Blink_AImatch_Bot`,
};

const FALLBACK: LanguageCode = 'ru';

export function getPrivateStartMsg(telegramLanguageCode?: string | null): string {
  const lang = resolveLangFromTelegram(telegramLanguageCode);
  return PRIVATE_START_MSG[lang] ?? PRIVATE_START_MSG[FALLBACK];
}
