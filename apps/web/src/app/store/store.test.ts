import { describe, expect, test } from 'vitest';

import { baseApi } from '@/shared/api';

import { appStore } from './store';

describe('appStore', () => {
  test('registers RTK Query api reducer and middleware', () => {
    expect(appStore.getState()).toHaveProperty(baseApi.reducerPath);
    expect(() => appStore.dispatch(baseApi.util.resetApiState())).not.toThrow();
  });
});
