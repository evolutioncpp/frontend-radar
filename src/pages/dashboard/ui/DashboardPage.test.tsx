import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  test('renders dashboard report content', () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole('heading', { name: 'Frontend project health overview' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'evolutioncpp/frontend-radar' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Frontend Health Score')).toBeInTheDocument();
    expect(screen.getByLabelText('Score breakdown')).toBeInTheDocument();
    expect(screen.getByLabelText('Project checks list')).toBeInTheDocument();
    expect(screen.getByLabelText('Recommendations list')).toBeInTheDocument();
  });
});
