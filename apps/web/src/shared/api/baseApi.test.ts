import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { baseApi, resolveApiBaseUrl } from './baseApi';
import { generatedApi } from './generatedApi';
import { githubTokenEndpointNames } from './githubTokenEndpoints';

const testApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBaseApiLanguageTest: build.query<{ ok: boolean }, void>({
      query: () => '/language-test',
    }),
  }),
});

const githubTokenTestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createReportAnalysis: build.mutation<{ ok: boolean }, void>({
      query: () => ({
        method: 'POST',
        url: '/token-test',
      }),
    }),
  }),
  overrideExisting: true,
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
};

const createTestStoreWithGithubToken = (githubToken: string) => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      appSettings: () => ({
        githubToken,
        isDashboardSidebarCollapsed: false,
        language: 'en',
        theme: 'dark',
      }),
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

  test('does not send saved GitHub token to endpoints that do not need GitHub access', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      }),
    );
    const store = createTestStoreWithGithubToken('  github_pat_test  ');

    await store.dispatch(testApi.endpoints.getBaseApiLanguageTest.initiate()).unwrap();

    const request = fetchMock.mock.calls[0]?.[0];

    expect(request).toBeInstanceOf(Request);
    expect((request as Request).headers.get('x-github-token')).toBeNull();
  });

  test('sends saved GitHub token to endpoints that need GitHub access', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      }),
    );
    const store = createTestStoreWithGithubToken('  github_pat_test  ');

    await store.dispatch(githubTokenTestApi.endpoints.createReportAnalysis.initiate()).unwrap();

    const request = fetchMock.mock.calls[0]?.[0];

    expect(request).toBeInstanceOf(Request);
    expect((request as Request).headers.get('x-github-token')).toBe('github_pat_test');
  });

  test('keeps GitHub token endpoint allowlist in sync with generated API endpoints', () => {
    expect(Object.keys(generatedApi.endpoints)).toEqual(
      expect.arrayContaining([...githubTokenEndpointNames]),
    );
  });
});

describe('resolveApiBaseUrl', () => {
  test('uses configured API URL when it is provided', () => {
    expect(
      resolveApiBaseUrl({
        PROD: true,
        VITE_API_BASE_URL: ' https://api.example.test ',
      }),
    ).toBe('https://api.example.test');
  });

  test('uses localhost fallback outside production', () => {
    expect(resolveApiBaseUrl({ PROD: false })).toBe('http://localhost:3001');
  });

  test('throws when production API URL is missing', () => {
    expect(() => resolveApiBaseUrl({ PROD: true })).toThrow(
      'VITE_API_BASE_URL is required in production builds.',
    );
  });
});
