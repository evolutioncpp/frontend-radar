import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ReportComparisonPanel } from './ReportComparisonPanel';

import type { GetReportComparisonApiResponse } from '@/entities/report';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'comparison.label': 'Comparison',
        'comparison.title': 'Changes since previous report',
        'comparison.description': 'Compare current and previous reports.',
        'comparison.totalScore': 'Total score',
        'comparison.metricsTitle': 'Metric changes',
        'comparison.changedChecksTitle': 'Changed checks',
        'comparison.recommendationsTitle': 'Recommendations',
        'comparison.noChangedChecks': 'No checks changed between reports.',
        'comparison.emptyRecommendations': 'No recommendation changes.',
        'comparison.resolvedBadge': 'Resolved',

        'statuses.excellent': 'Excellent',
        'statuses.good': 'Good',
        'statuses.warning': 'Warning',
        'statuses.critical': 'Critical',
        'statuses.passed': 'Passed',
        'statuses.failed': 'Failed',
        'statuses.high': 'High',
        'statuses.medium': 'Medium',
        'statuses.low': 'Low',
      };

      if (key === 'comparison.totalScoreDeltaAria') {
        return `Total score delta ${options?.delta}`;
      }

      if (key === 'comparison.addedRecommendations') {
        return `${options?.count} added`;
      }

      if (key === 'comparison.resolvedRecommendations') {
        return `${options?.count} resolved`;
      }

      if (key === 'comparison.persistentRecommendations') {
        return `${options?.count} persistent`;
      }

      return translations[key] ?? key;
    },
  }),
}));

const comparison: Extract<GetReportComparisonApiResponse, { status: 'available' }> = {
  status: 'available',
  currentReportId: 'current-id',
  previousReportId: 'previous-id',
  totalScore: {
    current: 82,
    previous: 70,
    delta: 12,
  },
  metrics: [
    {
      category: 'documentation',
      label: 'Documentation',
      currentValue: 82,
      previousValue: 70,
      delta: 12,
      currentStatus: 'good',
      previousStatus: 'warning',
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      label: 'README exists',
      previousStatus: 'failed',
      currentStatus: 'passed',
    },
  ],
  recommendations: {
    added: [],
    resolved: [
      {
        id: 'add-test-script',
        severity: 'high',
        title: 'Add an automated test script',
        description: 'Expose a test script.',
      },
    ],
    persistentCount: 1,
  },
};

describe('ReportComparisonPanel', () => {
  test('renders score, metric, check and recommendation deltas', () => {
    render(<ReportComparisonPanel comparison={comparison} />);

    expect(
      screen.getByRole('heading', { name: 'Changes since previous report' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Total score delta +12')).toHaveTextContent('+12');
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('README exists')).toBeInTheDocument();
    expect(screen.getByText('Add an automated test script')).toBeInTheDocument();
    expect(screen.getByText('1 persistent')).toBeInTheDocument();
  });
});
