import { afterEach, describe, expect, test, vi } from 'vitest';

import { setLanguage } from '@/features/app-settings';
import { baseApi } from '@/shared/api';
import { StorageKeys } from '@/shared/config/storage';

import { appStore } from './store';

describe('appStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  test('registers RTK Query api reducer and middleware', () => {
    expect(appStore.getState()).toHaveProperty(baseApi.reducerPath);
    expect(() => appStore.dispatch(baseApi.util.resetApiState())).not.toThrow();
  });

  test('persists app settings only when app settings state changes', () => {
    appStore.dispatch(baseApi.util.resetApiState());

    expect(localStorage.getItem(StorageKeys.APP_SETTINGS)).toBeNull();

    const nextLanguage = appStore.getState().appSettings.language === 'ru' ? 'en' : 'ru';

    appStore.dispatch(setLanguage(nextLanguage));

    expect(JSON.parse(localStorage.getItem(StorageKeys.APP_SETTINGS) ?? '{}')).toMatchObject({
      language: nextLanguage,
    });
  });
});
