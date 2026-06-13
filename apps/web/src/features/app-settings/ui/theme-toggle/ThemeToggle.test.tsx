import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, test, vi } from 'vitest';

import { appStore } from '@/app/store/store';

import { ThemeToggle } from './ThemeToggle';

vi.mock('react-i18next', () => ({
  initReactI18next: {
    init: vi.fn(),
    type: '3rdParty',
  },
  useTranslation: () => ({
    t: (key: string) =>
      key === 'actions.switchToLightTheme' ? 'Switch to light theme' : 'Switch to dark theme',
  }),
}));

const renderThemeToggle = () => {
  return render(
    <Provider store={appStore}>
      <ThemeToggle />
    </Provider>,
  );
};

describe('ThemeToggle', () => {
  test('renders theme toggle button', () => {
    renderThemeToggle();

    expect(
      screen.getByRole('button', {
        name: /switch to/i,
      }),
    ).toBeInTheDocument();
  });

  test('changes theme on click', () => {
    renderThemeToggle();

    const button = screen.getByRole('button', {
      name: /switch to/i,
    });

    fireEvent.click(button);

    expect(
      screen.getByRole('button', {
        name: /switch to/i,
      }),
    ).toBeInTheDocument();
  });
});
