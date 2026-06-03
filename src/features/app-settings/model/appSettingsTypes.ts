export type AppTheme = 'dark' | 'light';

export type AppLanguage = 'en' | 'ru';

export interface AppSettingsState {
  theme: AppTheme;
  language: AppLanguage;
  isDashboardSidebarCollapsed: boolean;
}
