import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { MetricsGrid } from './MetricsGrid';

import type { ScoreBreakdownItem } from '@/entities/report';

const metrics: ScoreBreakdownItem[] = [
  {
    category: 'documentation',
    label: 'Documentation',
    value: 88,
    maxValue: 100,
    status: 'good',
    description: 'README and setup documentation are mostly complete.',
  },
  {
    category: 'testing',
    label: 'Testing',
    value: 76,
    maxValue: 100,
    status: 'good',
    description: 'Unit and e2e testing foundation exists, but coverage can be improved.',
  },
  {
    category: 'ci',
    label: 'CI/CD',
    value: 92,
    maxValue: 100,
    status: 'excellent',
    description: 'Automated checks are configured for build and quality gates.',
  },
];

describe('MetricsGrid', () => {
  test('renders score breakdown section', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByLabelText('Score breakdown')).toBeInTheDocument();
  });

  test('renders metric titles', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByRole('heading', { name: 'Documentation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Testing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CI/CD' })).toBeInTheDocument();
  });

  test('renders metric scores', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('76')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  test('renders metric descriptions', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(
      screen.getByText('README and setup documentation are mostly complete.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Unit and e2e testing foundation exists, but coverage can be improved.'),
    ).toBeInTheDocument();
  });

  test('renders progressbars with correct values', () => {
    render(<MetricsGrid metrics={metrics} />);

    const documentationProgress = screen.getByLabelText('Documentation score progress');
    const testingProgress = screen.getByLabelText('Testing score progress');
    const ciProgress = screen.getByLabelText('CI/CD score progress');

    expect(documentationProgress).toHaveAttribute('aria-valuenow', '88');
    expect(testingProgress).toHaveAttribute('aria-valuenow', '76');
    expect(ciProgress).toHaveAttribute('aria-valuenow', '92');
  });

  test('renders status labels', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getAllByText('Good')).toHaveLength(2);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });
});
