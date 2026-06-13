import type { SupportedLanguage } from '@/shared/config/i18n';

export type AppTheme = 'dark' | 'light';

export type AppLanguage = SupportedLanguage;

export interface AppSettingsState {
  githubToken?: string;
  theme: AppTheme;
  language: AppLanguage;
  isDashboardSidebarCollapsed: boolean;
}
