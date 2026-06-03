import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import { DashboardPage } from './DashboardPage';

const renderDashboardPage = (initialEntry = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <DashboardPage />
    </MemoryRouter>,
  );
};

describe('DashboardPage', () => {
  test('renders dashboard report content', () => {
    renderDashboardPage();

    expect(
      screen.getByRole('heading', { name: 'Frontend project health overview' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Demo report')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Frontend Health Score/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quality metrics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quality signals' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recommendations' })).toBeInTheDocument();
  });

  test('renders section copy link buttons', () => {
    renderDashboardPage();

    expect(
      screen.getByRole('button', { name: 'Copy link to Repository summary section' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Copy link to Health score section' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Copy link to Quality metrics section' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Copy link to Project checks section' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Copy link to Recommendations section' }),
    ).toBeInTheDocument();
  });
});
