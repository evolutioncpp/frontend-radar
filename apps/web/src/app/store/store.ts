import { configureStore } from '@reduxjs/toolkit';

import { appSettingsReducer, saveAppSettingsState } from '@/features/app-settings';
import { baseApi } from '@/shared/api';

export const appStore = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    appSettings: appSettingsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

let previousAppSettingsState = appStore.getState().appSettings;

appStore.subscribe(() => {
  const nextAppSettingsState = appStore.getState().appSettings;

  if (nextAppSettingsState === previousAppSettingsState) {
    return;
  }

  previousAppSettingsState = nextAppSettingsState;
  saveAppSettingsState(nextAppSettingsState);
});

export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
