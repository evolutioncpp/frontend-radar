import { afterEach, describe, expect, test } from 'vitest';

import { StorageKeys } from '@/shared/config/storage';

import { loadAppSettingsState, saveAppSettingsState } from './appSettingsStorage';

describe('appSettingsStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  test('normalizes saved GitHub token', () => {
    localStorage.setItem(
      StorageKeys.APP_SETTINGS,
      JSON.stringify({
        githubToken: '  github_pat_test  ',
        isDashboardSidebarCollapsed: false,
        language: 'en',
        theme: 'dark',
      }),
    );

    expect(loadAppSettingsState().githubToken).toBe('github_pat_test');
  });

  test('does not persist blank GitHub token', () => {
    saveAppSettingsState({
      githubToken: '   ',
      isDashboardSidebarCollapsed: false,
      language: 'en',
      theme: 'dark',
    });

    const storedValue = localStorage.getItem(StorageKeys.APP_SETTINGS);

    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue ?? '{}')).not.toHaveProperty('githubToken');
  });
});
