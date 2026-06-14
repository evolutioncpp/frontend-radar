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

  test('adds report preference defaults for older saved settings', () => {
    localStorage.setItem(
      StorageKeys.APP_SETTINGS,
      JSON.stringify({
        isDashboardSidebarCollapsed: false,
        language: 'en',
        theme: 'dark',
      }),
    );

    expect(loadAppSettingsState()).toMatchObject({
      isReportHistoryEnabled: true,
      enabledScoreCategories: [
        'documentation',
        'testing',
        'ci',
        'dependencies',
        'maintainability',
        'performance',
        'accessibility',
      ],
    });
  });

  test('does not load an empty metric category set', () => {
    localStorage.setItem(
      StorageKeys.APP_SETTINGS,
      JSON.stringify({
        enabledScoreCategories: [],
        isDashboardSidebarCollapsed: false,
        language: 'en',
        theme: 'dark',
      }),
    );

    expect(loadAppSettingsState().enabledScoreCategories).toEqual([
      'documentation',
      'testing',
      'ci',
      'dependencies',
      'maintainability',
      'performance',
      'accessibility',
    ]);
  });

  test('does not persist blank GitHub token', () => {
    saveAppSettingsState({
      githubToken: '   ',
      isDashboardSidebarCollapsed: false,
      isReportHistoryEnabled: true,
      enabledScoreCategories: [
        'documentation',
        'testing',
        'ci',
        'dependencies',
        'maintainability',
        'performance',
        'accessibility',
      ],
      language: 'en',
      theme: 'dark',
    });

    const storedValue = localStorage.getItem(StorageKeys.APP_SETTINGS);

    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue ?? '{}')).not.toHaveProperty('githubToken');
  });
});
