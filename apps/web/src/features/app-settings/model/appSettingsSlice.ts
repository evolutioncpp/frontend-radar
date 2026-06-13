import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { loadAppSettingsState } from './appSettingsStorage';

import type { AppLanguage, AppTheme } from './appSettingsTypes';

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
    toggleDashboardSidebar: (state) => {
      state.isDashboardSidebarCollapsed = !state.isDashboardSidebarCollapsed;
    },
  },
});

export const {
  clearGithubToken,
  setDashboardSidebarCollapsed,
  setGithubToken,
  setLanguage,
  setTheme,
  toggleDashboardSidebar,
  toggleTheme,
} = appSettingsSlice.actions;

export const appSettingsReducer = appSettingsSlice.reducer;
