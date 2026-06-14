import { defaultLanguage, normalizeSupportedLanguage } from '@/shared/config/i18n';
import { StorageKeys } from '@/shared/config/storage';

import { reportScoreCategoryOptions } from './appSettingsTypes';

import type { AppSettingsState, AppTheme } from './appSettingsTypes';
import type { ScoreCategory } from '@/entities/report';

const defaultAppSettingsState: AppSettingsState = {
  theme: 'dark',
  language: defaultLanguage,
  isDashboardSidebarCollapsed: false,
  isReportHistoryEnabled: true,
  enabledScoreCategories: [...reportScoreCategoryOptions],
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isAppTheme = (value: unknown): value is AppTheme => {
  return value === 'dark' || value === 'light';
};

const normalizeEnabledScoreCategories = (value: unknown): ScoreCategory[] => {
  if (!Array.isArray(value)) {
    return [...defaultAppSettingsState.enabledScoreCategories];
  }

  const enabledCategories = reportScoreCategoryOptions.filter((category) =>
    value.some((item) => item === category),
  );

  return enabledCategories.length > 0
    ? enabledCategories
    : [...defaultAppSettingsState.enabledScoreCategories];
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
    isReportHistoryEnabled:
      typeof value.isReportHistoryEnabled === 'boolean'
        ? value.isReportHistoryEnabled
        : defaultAppSettingsState.isReportHistoryEnabled,
    enabledScoreCategories: normalizeEnabledScoreCategories(value.enabledScoreCategories),
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
