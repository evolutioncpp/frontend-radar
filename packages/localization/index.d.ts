export declare const supportedLanguages: readonly ['en', 'ru'];

export type SupportedLanguage = (typeof supportedLanguages)[number];

export declare const defaultLanguage: SupportedLanguage;

export declare const normalizeSupportedLanguage: (value: unknown) => SupportedLanguage;

export declare const getPreferredSupportedLanguage: (value: unknown) => SupportedLanguage;
