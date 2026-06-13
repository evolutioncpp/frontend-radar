import { defaultLanguage, normalizeSupportedLanguage } from '@frontend-radar/localization';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { shouldAttachGithubToken } from './githubTokenEndpoints';

interface ApiBaseUrlEnv {
  PROD?: boolean;
  VITE_API_BASE_URL?: unknown;
}

export const resolveApiBaseUrl = (env: ApiBaseUrlEnv) => {
  const apiUrl = typeof env.VITE_API_BASE_URL === 'string' ? env.VITE_API_BASE_URL.trim() : '';

  if (apiUrl) {
    return apiUrl;
  }

  if (env.PROD) {
    throw new Error('VITE_API_BASE_URL is required in production builds.');
  }

  return 'http://localhost:3001';
};

const apiBaseUrl = resolveApiBaseUrl(import.meta.env);

const getCurrentApiLanguage = () => {
  if (typeof document === 'undefined') {
    return defaultLanguage;
  }

  return normalizeSupportedLanguage(document.documentElement.lang);
};

const getCurrentGithubToken = (state: unknown) => {
  if (typeof state !== 'object' || state === null || !('appSettings' in state)) {
    return undefined;
  }

  const appSettings = (state as { appSettings?: { githubToken?: unknown } }).appSettings;
  const githubToken = appSettings?.githubToken;

  return typeof githubToken === 'string' ? githubToken.trim() || undefined : undefined;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers, { endpoint, getState }) => {
      headers.set('Accept-Language', getCurrentApiLanguage());
      const githubToken = getCurrentGithubToken(getState());

      if (githubToken && shouldAttachGithubToken(endpoint) && !headers.has('x-github-token')) {
        headers.set('x-github-token', githubToken);
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
});
