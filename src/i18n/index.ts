import { ruTexts } from './ru';
import { enTexts } from './en';
import { zhTexts } from './zh';
import type { LanguageCode } from '../state';
import type { I18nTexts } from './types';

export type Texts = I18nTexts;

const TEXTS: Record<LanguageCode, Texts> = {
  ru: ruTexts as Texts,
  en: enTexts as Texts,
  zh: zhTexts as Texts,
};

export function getTexts(lang: LanguageCode): Texts {
  return TEXTS[lang] ?? TEXTS.ru;
}
