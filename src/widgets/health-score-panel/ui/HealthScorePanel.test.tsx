import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { HealthScorePanel } from './HealthScorePanel';

describe('HealthScorePanel', () => {
  test('renders health score content', () => {
    render(<HealthScorePanel score={82} />);

    expect(screen.getByText('Frontend Health Score')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Overall project quality' })).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  test('renders progressbar with normalized score', () => {
    render(<HealthScorePanel score={82} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '82');
  });

  test('clamps score below zero', () => {
    render(<HealthScorePanel score={-20} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  test('clamps score above one hundred', () => {
    render(<HealthScorePanel score={140} />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  test('renders critical status for low score', () => {
    render(<HealthScorePanel score={42} />);

    expect(screen.getByText('Critical')).toBeInTheDocument();
  });
});
