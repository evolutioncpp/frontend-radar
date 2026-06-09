import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { baseApi } from './baseApi';

const testApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBaseApiLanguageTest: build.query<{ ok: boolean }, void>({
      query: () => '/language-test',
    }),
  }),
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
};

describe('baseApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.lang = '';
  });

  test('sends current i18n language as accept-language header', async () => {
    document.documentElement.lang = 'ru';
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      }),
    );
    const store = createTestStore();

    await store.dispatch(testApi.endpoints.getBaseApiLanguageTest.initiate()).unwrap();

    const request = fetchMock.mock.calls[0]?.[0];

    expect(request).toBeInstanceOf(Request);
    expect((request as Request).headers.get('accept-language')).toBe('ru');
  });
});
