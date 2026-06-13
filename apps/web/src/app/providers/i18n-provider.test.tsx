import { configureStore } from '@reduxjs/toolkit';
import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { setLanguage } from '@/features/app-settings';
import { appSettingsReducer } from '@/features/app-settings/model/appSettingsSlice';
import { baseApi } from '@/shared/api';
import { StorageKeys } from '@/shared/config/storage';

import { I18nProvider } from './i18n-provider';

import type { AppLanguage, AppSettingsState } from '@/features/app-settings';

const i18nMock = vi.hoisted(() => ({
  changeLanguage: vi.fn(),
}));

vi.mock('@/shared/config/i18n', () => ({
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ru'],
  normalizeSupportedLanguage: (value: unknown) => {
    return value === 'ru' ? 'ru' : 'en';
  },
  i18n: {
    language: 'en',
    resolvedLanguage: 'en',
    changeLanguage: i18nMock.changeLanguage,
  },
}));

const createTestStore = (language: AppLanguage = 'en') => {
  const preloadedState: { appSettings: AppSettingsState } = {
    appSettings: {
      theme: 'dark',
      language,
      isDashboardSidebarCollapsed: false,
    },
  };

  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      appSettings: appSettingsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState,
  });
};

const renderI18nProvider = (language: AppLanguage = 'en') => {
  const store = createTestStore(language);

  const view = render(
    <Provider store={store}>
      <I18nProvider />
    </Provider>,
  );

  return {
    store,
    ...view,
  };
};

describe('I18nProvider', () => {
  afterEach(() => {
    i18nMock.changeLanguage.mockClear();
    localStorage.clear();
    document.documentElement.lang = '';
  });

  test('sets html lang from app settings language', () => {
    localStorage.setItem(
      StorageKeys.APP_SETTINGS,
      JSON.stringify({
        theme: 'dark',
        language: 'ru',
        isDashboardSidebarCollapsed: false,
      }),
    );

    renderI18nProvider('ru');

    expect(document.documentElement.lang).toBe('ru');
  });

  test('changes i18n language when app settings language differs', async () => {
    localStorage.setItem(
      StorageKeys.APP_SETTINGS,
      JSON.stringify({
        theme: 'dark',
        language: 'ru',
        isDashboardSidebarCollapsed: false,
      }),
    );

    renderI18nProvider('ru');

    await waitFor(() => {
      expect(i18nMock.changeLanguage).toHaveBeenCalledWith('ru');
    });
  });

  test('invalidates reports cache when language changes', async () => {
    localStorage.setItem(
      StorageKeys.APP_SETTINGS,
      JSON.stringify({
        theme: 'dark',
        language: 'en',
        isDashboardSidebarCollapsed: false,
      }),
    );
    const { store } = renderI18nProvider('en');
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    act(() => {
      store.dispatch(setLanguage('ru'));
    });

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: ['Reports'],
          type: `${baseApi.reducerPath}/invalidateTags`,
        }),
      );
    });
  });
});
