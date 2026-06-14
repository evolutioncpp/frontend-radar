import type { ScoreCategory } from '@/entities/report';
import type { SupportedLanguage } from '@/shared/config/i18n';

export type AppTheme = 'dark' | 'light';

export type AppLanguage = SupportedLanguage;

export const reportScoreCategoryOptionMap = {
  documentation: {
    hintKey: 'reportPreferences.metrics.categoryHints.documentation',
    labelKey: 'reportPreferences.metrics.categories.documentation',
  },
  testing: {
    hintKey: 'reportPreferences.metrics.categoryHints.testing',
    labelKey: 'reportPreferences.metrics.categories.testing',
  },
  ci: {
    hintKey: 'reportPreferences.metrics.categoryHints.ci',
    labelKey: 'reportPreferences.metrics.categories.ci',
  },
  dependencies: {
    hintKey: 'reportPreferences.metrics.categoryHints.dependencies',
    labelKey: 'reportPreferences.metrics.categories.dependencies',
  },
  security: {
    hintKey: 'reportPreferences.metrics.categoryHints.security',
    labelKey: 'reportPreferences.metrics.categories.security',
  },
  maintainability: {
    hintKey: 'reportPreferences.metrics.categoryHints.maintainability',
    labelKey: 'reportPreferences.metrics.categories.maintainability',
  },
  performance: {
    hintKey: 'reportPreferences.metrics.categoryHints.performance',
    labelKey: 'reportPreferences.metrics.categories.performance',
  },
  accessibility: {
    hintKey: 'reportPreferences.metrics.categoryHints.accessibility',
    labelKey: 'reportPreferences.metrics.categories.accessibility',
  },
} as const satisfies Record<
  ScoreCategory,
  {
    hintKey: string;
    labelKey: string;
  }
>;

export const reportScoreCategoryOrder = [
  'documentation',
  'testing',
  'ci',
  'dependencies',
  'security',
  'maintainability',
  'performance',
  'accessibility',
] as const satisfies readonly ScoreCategory[];

export const reportScoreCategoryOptions: ScoreCategory[] = [...reportScoreCategoryOrder];

export type ReportScoreCategoryHintKey =
  (typeof reportScoreCategoryOptionMap)[ScoreCategory]['hintKey'];

export type ReportScoreCategoryLabelKey =
  (typeof reportScoreCategoryOptionMap)[ScoreCategory]['labelKey'];

export interface AppSettingsState {
  githubToken?: string;
  theme: AppTheme;
  language: AppLanguage;
  isDashboardSidebarCollapsed: boolean;
  isReportHistoryEnabled: boolean;
  enabledScoreCategories: ScoreCategory[];
}
