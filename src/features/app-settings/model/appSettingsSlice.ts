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
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.language = action.payload;
    },
    setDashboardSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isDashboardSidebarCollapsed = action.payload;
    },
    toggleDashboardSidebar: (state) => {
      state.isDashboardSidebarCollapsed = !state.isDashboardSidebarCollapsed;
    },
  },
});

export const { setDashboardSidebarCollapsed, setLanguage, setTheme, toggleDashboardSidebar } =
  appSettingsSlice.actions;

export const appSettingsReducer = appSettingsSlice.reducer;
