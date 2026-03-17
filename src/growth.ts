import { Markup } from 'telegraf';
import type { Texts } from './i18n';

// 中文注释：统一的导流 Inline Button 生成工具

/** 游戏结束按键跳转：@Blink_AImatch_Bot，可通过 BLINK_URL 覆盖 */
const BLINK_URL = process.env.BLINK_URL || 'https://t.me/Blink_AImatch_Bot';

export function withGrowthButtons(
  t: Texts,
  extraRows: ReturnType<typeof Markup.inlineKeyboard>['reply_markup']['inline_keyboard'] = [],
) {
  const growthButtonRow = [
    Markup.button.url(t.growth.ctaButton, BLINK_URL),
  ];

  return Markup.inlineKeyboard([...extraRows, growthButtonRow]);
}

