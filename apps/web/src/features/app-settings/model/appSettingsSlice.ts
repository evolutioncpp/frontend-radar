import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { loadAppSettingsState } from './appSettingsStorage';
import { reportScoreCategoryOptions } from './appSettingsTypes';

import type { AppLanguage, AppTheme } from './appSettingsTypes';
import type { ScoreCategory } from '@/entities/report';

const normalizeEnabledScoreCategories = (categories: readonly ScoreCategory[]) => {
  const normalizedCategories = reportScoreCategoryOptions.filter((category) =>
    categories.includes(category),
  );

  return normalizedCategories.length > 0 ? normalizedCategories : [...reportScoreCategoryOptions];
};

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: loadAppSettingsState(),
  reducers: {
    setTheme: (state, action: PayloadAction<AppTheme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.language = action.payload;
    },
    setGithubToken: (state, action: PayloadAction<string>) => {
      const githubToken = action.payload.trim();

      if (githubToken) {
        state.githubToken = githubToken;
        return;
      }

      delete state.githubToken;
    },
    clearGithubToken: (state) => {
      delete state.githubToken;
    },
    setDashboardSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isDashboardSidebarCollapsed = action.payload;
    },
    setReportHistoryEnabled: (state, action: PayloadAction<boolean>) => {
      state.isReportHistoryEnabled = action.payload;
    },
    setEnabledScoreCategories: (state, action: PayloadAction<ScoreCategory[]>) => {
      state.enabledScoreCategories = normalizeEnabledScoreCategories(action.payload);
    },
    toggleEnabledScoreCategory: (state, action: PayloadAction<ScoreCategory>) => {
      const category = action.payload;

      if (state.enabledScoreCategories.includes(category)) {
        if (state.enabledScoreCategories.length <= 1) {
          return;
        }

        state.enabledScoreCategories = state.enabledScoreCategories.filter(
          (enabledCategory) => enabledCategory !== category,
        );
        return;
      }

      state.enabledScoreCategories = normalizeEnabledScoreCategories([
        ...state.enabledScoreCategories,
        category,
      ]);
    },
    toggleDashboardSidebar: (state) => {
      state.isDashboardSidebarCollapsed = !state.isDashboardSidebarCollapsed;
    },
  },
});

export const {
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
} = appSettingsSlice.actions;

export const appSettingsReducer = appSettingsSlice.reducer;
