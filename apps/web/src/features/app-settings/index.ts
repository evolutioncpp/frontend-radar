export {
  appSettingsReducer,
  clearGithubToken,
  setDashboardSidebarCollapsed,
  setEnabledScoreCategories,
  setGithubToken,
  setLanguage,
  setReportHistoryEnabled,
  setTheme,
  toggleEnabledScoreCategory,
  toggleDashboardSidebar,
  toggleTheme,
} from './model/appSettingsSlice';

export {
  selectAppLanguage,
  selectAppTheme,
  selectGithubToken,
  selectHasGithubToken,
  selectEnabledScoreCategories,
  selectIsReportHistoryEnabled,
  selectIsDashboardSidebarCollapsed,
} from './model/appSettingsSelectors';

export { hasStoredAppLanguage, saveAppSettingsState } from './model/appSettingsStorage';
export { useValidateGithubTokenInputMutation } from './model/githubTokenApi';

export { LanguageSwitcher } from './ui/language-switcher';
export { ThemeToggle } from './ui/theme-toggle';

export type { AppLanguage, AppSettingsState, AppTheme } from './model/appSettingsTypes';
export { reportScoreCategoryOptions } from './model/appSettingsTypes';
