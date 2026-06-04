export const supportedLanguages = ['en', 'ru'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const defaultLanguage: SupportedLanguage = 'en';

export const normalizeSupportedLanguage = (value: unknown): SupportedLanguage => {
  if (typeof value !== 'string') {
    return defaultLanguage;
  }

  const language = value.split('-')[0];

  return supportedLanguages.includes(language as SupportedLanguage)
    ? (language as SupportedLanguage)
    : defaultLanguage;
};
