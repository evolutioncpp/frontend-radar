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

appStore.subscribe(() => {
  saveAppSettingsState(appStore.getState().appSettings);
});

export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
