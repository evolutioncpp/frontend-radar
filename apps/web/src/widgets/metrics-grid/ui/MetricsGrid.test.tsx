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
        'scoreDetails.title': 'Why this score',
        'scoreDetails.rawValue': 'Raw score',
        'scoreDetails.finalValue': 'Final score',
        'scoreDetails.impact': 'Influence',
        'scoreDetails.impactLevels.key': 'Key category',
        'scoreDetails.impactLevels.important': 'Important category',
        'scoreDetails.impactLevels.supporting': 'Supporting category',
        'scoreDetails.statuses.passed': 'Passed',
        'scoreDetails.statuses.partial': 'Partial',
        'scoreDetails.statuses.failed': 'Failed',
        'scoreDetails.statuses.unknown': 'Unknown',
        'scoreDetails.statuses.notApplicable': 'N/A',
        'scoreDetails.scopes.project': 'Project',
        'scoreDetails.scopes.root': 'Root',
        'scoreDetails.scopes.workspace': 'Workspace',
        'scoreDetails.scopes.repository': 'Repository',
        'scoreDetails.scopes.github': 'GitHub',
        'scoreDetails.severities.critical': 'Critical',
        'scoreDetails.severities.major': 'Major',
        'scoreDetails.severities.minor': 'Minor',
        'scoreDetails.confidences.high': 'High confidence',
        'scoreDetails.confidences.medium': 'Medium confidence',
        'scoreDetails.confidences.low': 'Low confidence',
      };

      if (key === 'scoreDetails.source') {
        return `Source: ${options?.source}`;
      }

      if (key === 'scoreDetails.points') {
        return `${options?.earned} / ${options?.max} pts`;
      }

      if (key === 'scoreDetails.cap.title') {
        return `Capped at ${options?.value}`;
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
    scoreDetails: {
      rawValue: 88,
      finalValue: 88,
      weight: 10,
      impactLevel: 'supporting',
      checks: [
        {
          id: 'readme',
          label: 'README',
          status: 'passed',
          severity: 'critical',
          scope: 'project',
          confidence: 'high',
          earned: 45,
          max: 45,
          source: 'README',
        },
      ],
    },
  },
  {
    category: 'testing',
    label: 'Testing',
    value: 76,
    maxValue: 100,
    status: 'good',
    description: 'Unit and e2e testing foundation exists, but coverage can be improved.',
    scoreDetails: {
      rawValue: 76,
      finalValue: 76,
      weight: 18,
      impactLevel: 'key',
      cap: {
        value: 89,
        reason: 'A key scoring check is only partially satisfied.',
        source: 'package.json scripts.test',
      },
      checks: [
        {
          id: 'test-script',
          label: 'Test script',
          status: 'partial',
          severity: 'major',
          scope: 'root',
          confidence: 'medium',
          earned: 24,
          max: 45,
          description: 'Only a root-level monorepo script was found.',
          source: 'package.json scripts.test',
        },
      ],
    },
  },
  {
    category: 'ci',
    label: 'CI/CD',
    value: 92,
    maxValue: 100,
    status: 'excellent',
    description: 'Automated checks are configured for build and quality gates.',
    scoreDetails: {
      rawValue: 92,
      finalValue: 92,
      weight: 18,
      impactLevel: 'key',
      checks: [
        {
          id: 'github-actions',
          label: 'GitHub Actions',
          status: 'passed',
          severity: 'critical',
          scope: 'github',
          confidence: 'high',
          earned: 20,
          max: 20,
          source: '.github/workflows',
        },
      ],
    },
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

  test('renders metric score details disclosures', () => {
    render(<MetricsGrid metrics={metrics} />);

    expect(screen.getAllByText('Why this score')).toHaveLength(3);
    expect(screen.getAllByText('Key category')).toHaveLength(2);
    expect(screen.getByText('Supporting category')).toBeInTheDocument();
    expect(screen.getByText('24 / 45 pts')).toBeInTheDocument();
    expect(screen.getByText('Only a root-level monorepo script was found.')).toBeInTheDocument();
  });
});
