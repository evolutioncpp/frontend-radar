import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, test } from 'vitest';

import { appStore } from '@/app/store/store';

import { ThemeToggle } from './ThemeToggle';

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
