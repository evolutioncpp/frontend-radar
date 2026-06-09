import { defaultLanguage, normalizeSupportedLanguage } from '@frontend-radar/localization';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiBaseUrl =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:3001';

const getCurrentApiLanguage = () => {
  if (typeof document === 'undefined') {
    return defaultLanguage;
  }

  return normalizeSupportedLanguage(document.documentElement.lang);
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
      headers.set('Accept-Language', getCurrentApiLanguage());

      return headers;
    },
  }),
  endpoints: () => ({}),
});
