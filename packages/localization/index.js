export const supportedLanguages = ['en', 'ru'];

export const defaultLanguage = 'en';

const normalizeLanguageCode = (value) => {
  return value.trim().split('-')[0].toLowerCase();
};

export const normalizeSupportedLanguage = (value) => {
  if (typeof value !== 'string') {
    return defaultLanguage;
  }

  const language = normalizeLanguageCode(value);

  return supportedLanguages.includes(language) ? language : defaultLanguage;
};

export const getPreferredSupportedLanguage = (value) => {
  if (typeof value !== 'string') {
    return defaultLanguage;
  }

  const languageRanges = value
    .split(',')
    .map((part, index) => {
      const [rawLanguage, ...parameters] = part.trim().split(';');
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;

      return {
        index,
        language: rawLanguage,
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((range) => range.language && range.quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index);

  for (const range of languageRanges) {
    const language = normalizeLanguageCode(range.language);

    if (supportedLanguages.includes(language)) {
      return language;
    }
  }

  return defaultLanguage;
};
