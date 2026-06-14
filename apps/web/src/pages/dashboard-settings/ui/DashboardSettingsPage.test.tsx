import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { appSettingsReducer } from '@/features/app-settings';
import { baseApi } from '@/shared/api';

import { DashboardSettingsPage } from './DashboardSettingsPage';

const translations: Record<string, string> = {
  'page.label': 'Settings',
  'page.title': 'Application settings',
  'page.description': 'Configure local access options for repository analysis.',
  'githubAccess.title': 'GitHub access',
  'githubAccess.description': 'Add a personal access token.',
  'githubAccess.saved.title': 'GitHub token saved',
  'githubAccess.saved.description': 'Frontend Radar will send {{token}}.',
  'githubAccess.empty.title': 'No GitHub token saved',
  'githubAccess.empty.description': 'Public repositories still work.',
  'githubAccess.token.label': 'GitHub token',
  'githubAccess.token.placeholder': 'github_pat_...',
  'githubAccess.token.hint': 'The token is stored only in this browser.',
  'githubAccess.actions.save': 'Save token',
  'githubAccess.actions.check': 'Check token',
  'githubAccess.actions.validateAndSave': 'Check and save token',
  'githubAccess.actions.checking': 'Checking...',
  'githubAccess.actions.remove': 'Remove',
  'githubAccess.actions.help': 'How to create token?',
  'githubAccess.help.title': 'Create a GitHub token',
  'githubAccess.help.description': 'Use a fine-grained personal access token.',
  'githubAccess.help.close': 'Close',
  'githubAccess.help.openGithub': 'Open GitHub token settings',
  'githubAccess.help.steps.title': 'Steps',
  'githubAccess.help.steps.openSettings': 'Open GitHub developer settings.',
  'githubAccess.help.steps.createFineGrained': 'Create a fine-grained token.',
  'githubAccess.help.steps.selectRepositories': 'Select repositories.',
  'githubAccess.help.steps.copyToken': 'Copy the token.',
  'githubAccess.help.permissions.title': 'Required permissions',
  'githubAccess.help.permissions.contents.title': 'Contents: Read-only',
  'githubAccess.help.permissions.contents.description': 'Read repository files.',
  'githubAccess.help.permissions.metadata.title': 'Metadata: Read-only',
  'githubAccess.help.permissions.metadata.description': 'Read repository metadata.',
  'githubAccess.help.storage.title': 'Where the token is stored',
  'githubAccess.help.storage.description': 'The token is stored only in this browser.',
  'githubAccess.validation.missing': 'Enter a GitHub token first.',
  'githubAccess.validation.success': 'GitHub accepted this token.',
  'githubAccess.validation.errors.forbidden':
    'GitHub rejected this token. Repository access is verified during analysis.',
  'githubAccess.validation.errors.missing': 'Enter a GitHub token first.',
  'githubAccess.validation.errors.rateLimited': 'GitHub rate limit was reached.',
  'githubAccess.validation.errors.unavailable': 'GitHub is unavailable.',
  'githubAccess.validation.errors.unknown': 'Could not validate this token.',
  'reportPreferences.title': 'Report preferences',
  'reportPreferences.description': 'Choose report preferences.',
  'reportPreferences.history.label': 'Save analysis runs to history',
  'reportPreferences.history.hint': 'Hidden reports stay available by direct link.',
  'reportPreferences.metrics.title': 'Enabled metrics',
  'reportPreferences.metrics.description': 'Choose included metrics.',
  'reportPreferences.metrics.lastEnabledHint': 'At least one metric must stay enabled.',
  'reportPreferences.metrics.categories.documentation': 'Documentation',
  'reportPreferences.metrics.categories.testing': 'Testing',
  'reportPreferences.metrics.categories.ci': 'CI/CD',
  'reportPreferences.metrics.categories.dependencies': 'Dependencies',
  'reportPreferences.metrics.categories.maintainability': 'Maintainability',
  'reportPreferences.metrics.categories.performance': 'Performance',
  'reportPreferences.metrics.categories.accessibility': 'Accessibility',
  'reportPreferences.metrics.categoryHints.documentation': 'README and setup.',
  'reportPreferences.metrics.categoryHints.testing': 'Tests.',
  'reportPreferences.metrics.categoryHints.ci': 'CI.',
  'reportPreferences.metrics.categoryHints.dependencies': 'Dependencies.',
  'reportPreferences.metrics.categoryHints.maintainability': 'Maintainability.',
  'reportPreferences.metrics.categoryHints.performance': 'Performance.',
  'reportPreferences.metrics.categoryHints.accessibility': 'Accessibility.',
};

vi.mock('react-i18next', () => ({
  initReactI18next: {
    init: vi.fn(),
    type: '3rdParty',
  },
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) =>
      (translations[key] ?? key).replace('{{token}}', options?.token ?? ''),
  }),
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      appSettings: appSettingsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

const renderSettingsPage = () => {
  const store = createTestStore();

  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <DashboardSettingsPage />
      </Provider>,
    ),
  };
};

describe('DashboardSettingsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  test('validates current GitHub token through API before saving it', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = input instanceof Request ? input.url : String(input);

      return Promise.resolve(
        new Response(
          JSON.stringify(url.includes('/github/token/validate') ? { status: 'valid' } : {}),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            status: 200,
          },
        ),
      );
    });

    const { store, user } = renderSettingsPage();

    await user.type(screen.getByLabelText('GitHub token'), 'github_pat_valid');
    await user.click(screen.getByRole('button', { name: 'Check and save token' }));

    await screen.findByText('GitHub accepted this token.');
    expect(store.getState().appSettings.githubToken).toBe('github_pat_valid');
    expect(screen.getByText('GitHub token saved')).toBeInTheDocument();
    expect(screen.getByText('Frontend Radar will send ********alid.')).toBeInTheDocument();

    await waitFor(() => {
      const validationRequest = fetchMock.mock.calls
        .map(([request]) => request)
        .find(
          (request) => request instanceof Request && request.url.includes('/github/token/validate'),
        );

      expect(validationRequest).toBeInstanceOf(Request);
      expect((validationRequest as Request).headers.get('x-github-token')).toBe('github_pat_valid');
    });

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(store.getState().appSettings.githubToken).toBeUndefined();
    expect(screen.getByText('No GitHub token saved')).toBeInTheDocument();
  });

  test('does not save GitHub token when validation fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'repository_forbidden',
          message: 'GitHub rejected this token. Repository access is verified during analysis.',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 403,
        },
      ),
    );

    const { store, user } = renderSettingsPage();

    await user.type(screen.getByLabelText('GitHub token'), 'github_pat_invalid');
    await user.click(screen.getByRole('button', { name: 'Check and save token' }));

    await screen.findByText(
      'GitHub rejected this token. Repository access is verified during analysis.',
    );

    expect(store.getState().appSettings.githubToken).toBeUndefined();
  });

  test('shows validation error for empty token', async () => {
    const { user } = renderSettingsPage();

    await user.click(screen.getByRole('button', { name: 'Check and save token' }));

    expect(screen.getByText('Enter a GitHub token first.')).toBeInTheDocument();
  });

  test('opens GitHub token help modal', async () => {
    const { user } = renderSettingsPage();

    await user.click(screen.getByRole('button', { name: 'How to create token?' }));

    expect(screen.getByRole('dialog', { name: 'Create a GitHub token' })).toBeInTheDocument();
    expect(screen.getByText('Contents: Read-only')).toBeInTheDocument();
    expect(screen.getByText('Metadata: Read-only')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Close' }).at(-1)!);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('toggles history visibility setting', async () => {
    const { store, user } = renderSettingsPage();
    const historyCheckbox = screen.getByRole('checkbox', {
      name: /Save analysis runs to history/i,
    });

    expect(historyCheckbox).toBeChecked();

    await user.click(historyCheckbox);

    expect(store.getState().appSettings.isReportHistoryEnabled).toBe(false);
    expect(historyCheckbox).not.toBeChecked();
  });

  test('toggles metric categories and keeps the last one enabled', async () => {
    const { store, user } = renderSettingsPage();

    await user.click(screen.getByRole('checkbox', { name: /^Documentation/i }));

    expect(store.getState().appSettings.enabledScoreCategories).not.toContain('documentation');

    for (const label of ['Testing', 'CI/CD', 'Dependencies', 'Maintainability', 'Performance']) {
      await user.click(screen.getByRole('checkbox', { name: new RegExp(`^${label}`) }));
    }

    const accessibilityCheckbox = screen.getByRole('checkbox', { name: /^Accessibility/i });

    expect(accessibilityCheckbox).toBeChecked();
    expect(accessibilityCheckbox).toBeDisabled();
    expect(store.getState().appSettings.enabledScoreCategories).toEqual(['accessibility']);
  });
});
