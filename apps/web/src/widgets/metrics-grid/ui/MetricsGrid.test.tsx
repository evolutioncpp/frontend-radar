import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { MetricsGrid } from './MetricsGrid';

import type { ScoreBreakdownItem } from '@/entities/report';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'metrics.label': 'Score breakdown',
        'metrics.title': 'Quality metrics',
        'metrics.listAria': 'Metrics list',
        'statuses.excellent': 'Excellent',
        'statuses.good': 'Good',
        'statuses.warning': 'Warning',
        'statuses.critical': 'Critical',
        'evidence.title': 'Evidence',
        'evidence.statuses.found': 'Found',
        'evidence.statuses.missing': 'Missing',
        'evidence.statuses.warning': 'Warning',
      };

      if (key === 'evidence.source') {
        return `Source: ${options?.source}`;
      }

      if (key === 'metrics.counter') {
        return `${options?.count} ${options?.count === 1 ? 'metric' : 'metrics'}`;
      }

      if (key === 'metrics.scoreAria') {
        return `${options?.label} score ${options?.score} out of ${options?.max}`;
      }

      if (key === 'metrics.progressAria') {
        return `${options?.label} score progress`;
      }

      return translations[key] ?? key;
    },
  }),
}));

const metrics: ScoreBreakdownItem[] = [
  {
    category: 'documentation',
    label: 'Documentation',
    value: 88,
    maxValue: 100,
    status: 'good',
    description: 'README and setup documentation are mostly complete.',
    evidence: [
      {
        id: 'readme',
        label: 'README',
        status: 'found',
        source: 'README',
      },
    ],
  },
  {
    category: 'testing',
    label: 'Testing',
    value: 76,
    maxValue: 100,
    status: 'good',
    description: 'Unit and e2e testing foundation exists, but coverage can be improved.',
    evidence: [
      {
        id: 'test-script',
        label: 'Test script',
        status: 'found',
        source: 'package.json scripts.test',
      },
    ],
  },
  {
    category: 'ci',
    label: 'CI/CD',
    value: 92,
    maxValue: 100,
    status: 'excellent',
    description: 'Automated checks are configured for build and quality gates.',
    evidence: [
      {
        id: 'github-actions',
        label: 'GitHub Actions',
        status: 'found',
        source: '.github/workflows',
      },
    ],
  },
];

describe('MetricsGrid', () => {
  test('renders score breakdown section', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByLabelText('Score breakdown')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quality metrics' })).toBeInTheDocument();
  });

  test('renders metrics counter', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByText('3 metrics')).toBeInTheDocument();
  });

  test('renders metrics list', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByLabelText('Metrics list')).toBeInTheDocument();
  });

  test('renders metric titles', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByRole('heading', { name: 'Documentation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Testing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CI/CD' })).toBeInTheDocument();
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

  test('renders metric scores', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByLabelText('Documentation score 88 out of 100')).toBeInTheDocument();
    expect(screen.getByLabelText('Testing score 76 out of 100')).toBeInTheDocument();
    expect(screen.getByLabelText('CI/CD score 92 out of 100')).toBeInTheDocument();
  });

  test('renders progressbars with correct values', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getByLabelText('Documentation score progress')).toHaveAttribute(
      'aria-valuenow',
      '88',
    );

    expect(screen.getByLabelText('Testing score progress')).toHaveAttribute('aria-valuenow', '76');

    expect(screen.getByLabelText('CI/CD score progress')).toHaveAttribute('aria-valuenow', '92');
  });

  test('renders status labels', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getAllByText('Good')).toHaveLength(2);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  test('renders metric evidence disclosures', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getAllByText('Evidence')).toHaveLength(3);
    expect(screen.getByText('Test script')).toBeInTheDocument();
    expect(screen.getByText('Source: package.json scripts.test')).toBeInTheDocument();
  });
});
