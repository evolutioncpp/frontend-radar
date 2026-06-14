import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, test, vi } from 'vitest';

import { appSettingsReducer } from '@/features/app-settings/model/appSettingsSlice';

import { LanguageSwitcher } from './LanguageSwitcher';

import type { AppLanguage, AppSettingsState } from '@/features/app-settings/model/appSettingsTypes';

const translations: Record<string, string> = {
  'actions.switchLanguage': 'Switch language',
  'common.language': 'Language',
  'common.languages.en': 'English',
  'common.languages.ru': 'Русский',
};

vi.mock('@/shared/config/i18n', () => ({
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ru'],
  normalizeSupportedLanguage: (value: unknown) => {
    return value === 'ru' ? 'ru' : 'en';
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}));

const createTestStore = (language: AppLanguage = 'en') => {
  const preloadedState: { appSettings: AppSettingsState } = {
    appSettings: {
      theme: 'dark',
      language,
      isDashboardSidebarCollapsed: false,
      isReportHistoryEnabled: true,
      enabledScoreCategories: [
        'documentation',
        'testing',
        'ci',
        'dependencies',
        'security',
        'maintainability',
        'performance',
        'accessibility',
      ],
    },
  };

  return configureStore({
    reducer: {
      appSettings: appSettingsReducer,
    },
    preloadedState,
  });
};

const renderLanguageSwitcher = ({
  language = 'en',
  ...props
}: Partial<React.ComponentProps<typeof LanguageSwitcher>> & {
  language?: AppLanguage;
} = {}) => {
  const store = createTestStore(language);

  const view = render(
    <Provider store={store}>
      <LanguageSwitcher {...props} />
    </Provider>,
  );

  return {
    store,
    ...view,
  };
};

describe('LanguageSwitcher', () => {
  test('renders sidebar trigger with language text', () => {
    renderLanguageSwitcher();

    expect(screen.getByRole('button', { name: 'Switch language' })).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  test('does not render visible text for icon variant', () => {
    renderLanguageSwitcher({ variant: 'icon', side: 'bottom' });

    expect(screen.getByRole('button', { name: 'Switch language' })).toBeInTheDocument();
    expect(screen.queryByText('Language')).not.toBeInTheDocument();
  });

  test('opens language options', () => {
    renderLanguageSwitcher();

    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Русский' })).toBeInTheDocument();
  });

  test('marks current language as selected', () => {
    renderLanguageSwitcher({ language: 'ru' });

    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));

    expect(screen.getByRole('menuitemradio', { name: 'Русский' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    expect(screen.getByRole('menuitemradio', { name: 'English' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  test('changes language on option click', async () => {
    const { store } = renderLanguageSwitcher({ language: 'en' });

    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Русский' }));

    expect(store.getState().appSettings.language).toBe('ru');

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
