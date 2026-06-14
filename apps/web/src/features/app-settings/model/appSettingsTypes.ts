import type { ScoreCategory } from '@/entities/report';
import type { SupportedLanguage } from '@/shared/config/i18n';

export type AppTheme = 'dark' | 'light';

export type AppLanguage = SupportedLanguage;

export const reportScoreCategoryOptions = [
  'documentation',
  'testing',
  'ci',
  'dependencies',
  'security',
  'maintainability',
  'performance',
  'accessibility',
] as const satisfies readonly ScoreCategory[];

export interface AppSettingsState {
  githubToken?: string;
  theme: AppTheme;
  language: AppLanguage;
  isDashboardSidebarCollapsed: boolean;
  isReportHistoryEnabled: boolean;
  enabledScoreCategories: ScoreCategory[];
}
