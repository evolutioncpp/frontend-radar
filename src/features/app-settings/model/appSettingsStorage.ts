import { StorageKeys } from '@/shared/config/storage';

import type { AppLanguage, AppSettingsState, AppTheme } from './appSettingsTypes';

const defaultAppSettingsState: AppSettingsState = {
  theme: 'dark',
  language: 'en',
  isDashboardSidebarCollapsed: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isAppTheme = (value: unknown): value is AppTheme => {
  return value === 'dark' || value === 'light';
};

const isAppLanguage = (value: unknown): value is AppLanguage => {
  return value === 'en' || value === 'ru';
};

const canUseLocalStorage = () => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

const normalizeAppSettingsState = (value: unknown): AppSettingsState => {
  if (!isRecord(value)) {
    return defaultAppSettingsState;
  }

  return {
    theme: isAppTheme(value.theme) ? value.theme : defaultAppSettingsState.theme,
    language: isAppLanguage(value.language) ? value.language : defaultAppSettingsState.language,
    isDashboardSidebarCollapsed:
      typeof value.isDashboardSidebarCollapsed === 'boolean'
        ? value.isDashboardSidebarCollapsed
        : defaultAppSettingsState.isDashboardSidebarCollapsed,
  };
};

export const loadAppSettingsState = (): AppSettingsState => {
  if (!canUseLocalStorage()) {
    return defaultAppSettingsState;
  }

  try {
    const storedValue = localStorage.getItem(StorageKeys.APP_SETTINGS);

    if (!storedValue) {
      return defaultAppSettingsState;
    }

    return normalizeAppSettingsState(JSON.parse(storedValue));
  } catch {
    return defaultAppSettingsState;
  }
};

export const saveAppSettingsState = (state: AppSettingsState) => {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    localStorage.setItem(StorageKeys.APP_SETTINGS, JSON.stringify(state));
  } catch {
    // Ignore localStorage write errors.
  }
};
