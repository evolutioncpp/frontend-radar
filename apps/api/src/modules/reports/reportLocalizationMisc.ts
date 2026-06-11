import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

type ReportLocalizationMisc = Pick<
  ReportLocalizationCatalog,
  'toolingNotDetected' | 'reportNotFound' | 'reportRefreshUnavailable'
>;

export const reportLocalizationMisc = {
  en: {
    toolingNotDetected: 'Not detected',
    reportNotFound: 'Report analysis not found',
    reportRefreshUnavailable: 'Only completed reports can be refreshed.',
  },
  ru: {
    toolingNotDetected: 'Не обнаружено',
    reportNotFound: 'Отчёт анализа не найден.',
    reportRefreshUnavailable: 'Обновить можно только готовый отчёт.',
  },
} satisfies Record<SupportedLanguage, ReportLocalizationMisc>;
