import { defaultLanguage, normalizeSupportedLanguage } from '@/shared/config/i18n';
import { StorageKeys } from '@/shared/config/storage';

import type { AppSettingsState, AppTheme } from './appSettingsTypes';

const defaultAppSettingsState: AppSettingsState = {
  theme: 'dark',
  language: defaultLanguage,
  isDashboardSidebarCollapsed: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isAppTheme = (value: unknown): value is AppTheme => {
  return value === 'dark' || value === 'light';
};

const canUseLocalStorage = () => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

const normalizeAppSettingsState = (value: unknown): AppSettingsState => {
  if (!isRecord(value)) {
    return defaultAppSettingsState;
  }

  const githubToken = typeof value.githubToken === 'string' ? value.githubToken.trim() : '';

  return {
    theme: isAppTheme(value.theme) ? value.theme : defaultAppSettingsState.theme,
    language: normalizeSupportedLanguage(value.language),
    isDashboardSidebarCollapsed:
      typeof value.isDashboardSidebarCollapsed === 'boolean'
        ? value.isDashboardSidebarCollapsed
        : defaultAppSettingsState.isDashboardSidebarCollapsed,
    ...(githubToken ? { githubToken } : {}),
  };
};

export const hasStoredAppLanguage = () => {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    const storedValue = localStorage.getItem(StorageKeys.APP_SETTINGS);

    if (!storedValue) {
      return false;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    return isRecord(parsedValue) && typeof parsedValue.language === 'string';
  } catch {
    return false;
  }
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
    const githubToken = state.githubToken?.trim();

    localStorage.setItem(
      StorageKeys.APP_SETTINGS,
      JSON.stringify({
        ...state,
        ...(githubToken ? { githubToken } : { githubToken: undefined }),
      }),
    );
  } catch {
    // Ignore localStorage write errors.
  }
};
