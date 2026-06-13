import type { AppSettingsState } from './appSettingsTypes';

interface AppSettingsRootState {
  appSettings: AppSettingsState;
}

export const selectAppTheme = (state: AppSettingsRootState) => {
  return state.appSettings.theme;
};

export const selectAppLanguage = (state: AppSettingsRootState) => {
  return state.appSettings.language;
};

export const selectIsDashboardSidebarCollapsed = (state: AppSettingsRootState) => {
  return state.appSettings.isDashboardSidebarCollapsed;
};

export const selectGithubToken = (state: AppSettingsRootState) => {
  return state.appSettings.githubToken?.trim() || undefined;
};

export const selectHasGithubToken = (state: AppSettingsRootState) => {
  return Boolean(selectGithubToken(state));
};
