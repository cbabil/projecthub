import React, { createContext, useContext, useMemo } from 'react';

import { getDictionary, TranslationKeys } from '../../i18n';
import { useSettings } from './SettingsContext.js';

interface TranslationContextValue {
  language: string;
  t: (key: TranslationKeys) => string;
}

const TranslationContext = createContext<TranslationContextValue>({
  language: 'en',
  t: (key) => key
});

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const language = settings?.language ?? 'en';
  const dictionary = useMemo(() => getDictionary(language), [language]);

  const value = useMemo(
    () => ({
      language,
      t: (key: TranslationKeys) => dictionary[key] ?? getDictionary('en')[key] ?? key
    }),
    [language, dictionary]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslation = () => useContext(TranslationContext);
