import en, { TranslationKeys } from './en/common';
import fr from './fr/common';
import ja from './ja/common';

const dictionaries = {
  en,
  fr,
  ja
};

export type SupportedLanguage = keyof typeof dictionaries;

export const getDictionary = (lang: string) => {
  if (lang in dictionaries) {
    return dictionaries[lang as SupportedLanguage];
  }
  return dictionaries.en;
};

export type { TranslationKeys };
