import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationScoreCaps = {
  en: {
    'A critical scoring check is missing.': 'A critical scoring check is missing.',
    'A key scoring check is only partially satisfied.':
      'A key scoring check is only partially satisfied.',
  },
  ru: {
    'A critical scoring check is missing.': 'Отсутствует критичная проверка оценки.',
    'A key scoring check is only partially satisfied.':
      'Ключевая проверка оценки выполнена только частично.',
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['scoreCaps']>;
