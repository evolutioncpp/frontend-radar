import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { defaultLanguage, supportedLanguages } from './languages';

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: (code) => {
      const language = code?.split('-')[0];

      return language &&
        supportedLanguages.includes(language as (typeof supportedLanguages)[number])
        ? []
        : [defaultLanguage];
    },

    load: 'languageOnly',
    supportedLngs: [...supportedLanguages],
    nonExplicitSupportedLngs: true,

    defaultNS: 'common',
    ns: ['common'],

    debug: import.meta.env.DEV,
    returnNull: false,

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['querystring', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      caches: [],
    },

    react: {
      useSuspense: true,
    },
  });

export { i18n };
