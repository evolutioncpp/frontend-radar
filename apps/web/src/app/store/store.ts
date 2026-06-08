import { configureStore } from '@reduxjs/toolkit';

import { appSettingsReducer, saveAppSettingsState } from '@/features/app-settings';

export const appStore = configureStore({
  reducer: {
    appSettings: appSettingsReducer,
  },
});

appStore.subscribe(() => {
  saveAppSettingsState(appStore.getState().appSettings);
});
