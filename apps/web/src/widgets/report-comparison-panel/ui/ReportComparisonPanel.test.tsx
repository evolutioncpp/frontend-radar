import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { ReportComparisonPanel } from './ReportComparisonPanel';
import { ReportComparisonUnavailablePanel } from './ReportComparisonUnavailablePanel';

import type { GetReportComparisonApiResponse } from '@/entities/report';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'comparison.label': 'Comparison',
        'comparison.title': 'Changes since previous report',
        'comparison.manualTitle': 'Comparison with selected run',
        'comparison.description': 'Compare current and previous reports.',
        'comparison.manualDescription': 'Compare current report with selected history run.',
        'comparison.branchContext': `Branch: ${options?.branch}`,
        'comparison.totalScore': 'Total score',
        'comparison.noDelta': 'No change',
        'comparison.metricsTitle': 'Metric changes',
        'comparison.noMetricChanges': 'No metric changes',
        'comparison.changedChecksTitle': 'Changed checks',
        'comparison.recommendationsTitle': 'Recommendations',
        'comparison.noChangedChecks': 'No checks changed between reports.',
        'comparison.emptyRecommendations': 'No recommendation changes.',
        'comparison.improvedTitle': 'Improved',
        'comparison.worsenedTitle': 'Needs attention',
        'comparison.noImprovedItems': 'No improvements detected.',
        'comparison.noWorsenedItems': 'No regressions detected.',
        'comparison.noChangesTitle': 'No changes since previous report',
        'comparison.noChangesDescription':
          'Score, metrics, checks and recommendations match the previous completed report.',
        'comparison.resolvedBadge': 'Resolved',
        'comparison.unavailable.title': 'Comparison unavailable',
        'comparison.unavailable.description':
          'Frontend Radar could not compare the selected reports.',
        'comparison.unavailable.reasons.differentScoreCategories':
          'The selected reports were created with different enabled metric sets.',

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

      if (key === 'comparison.improvedMetrics') {
        return `${options?.count} improved`;
      }

      if (key === 'comparison.worsenedMetrics') {
        return `${options?.count} regressed`;
      }

      if (key === 'comparison.unchangedMetrics') {
        return `${options?.count} unchanged metrics`;
      }

      if (key === 'comparison.groupItems') {
        return `${options?.count} changes`;
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
    {
      category: 'ci',
      label: 'CI/CD',
      currentValue: 65,
      previousValue: 80,
      delta: -15,
      currentStatus: 'warning',
      previousStatus: 'good',
    },
    {
      category: 'testing',
      label: 'Testing',
      currentValue: 100,
      previousValue: 100,
      delta: 0,
      currentStatus: 'excellent',
      previousStatus: 'excellent',
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      label: 'README exists',
      previousStatus: 'failed',
      currentStatus: 'passed',
    },
    {
      id: 'github-actions-exists',
      label: 'GitHub Actions workflow exists',
      previousStatus: 'passed',
      currentStatus: 'failed',
    },
  ],
  recommendations: {
    added: [
      {
        id: 'restore-ci',
        severity: 'high',
        title: 'Restore CI workflows',
        description: 'Bring CI coverage back.',
      },
    ],
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
  test('groups score, metric, check and recommendation changes by meaning', () => {
    render(<ReportComparisonPanel branch="main" comparison={comparison} />);

    expect(
      screen.getByRole('heading', { name: 'Changes since previous report' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Total score delta +12')).toHaveTextContent('+12');
    expect(screen.getByText('Branch: main')).toBeInTheDocument();
    expect(screen.getByText('1 improved')).toBeInTheDocument();
    expect(screen.getByText('1 regressed')).toBeInTheDocument();
    expect(screen.getByText('1 unchanged metrics')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Improved' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('CI/CD')).toBeInTheDocument();
    expect(screen.getByText('README exists')).toBeInTheDocument();
    expect(screen.getByText('GitHub Actions workflow exists')).toBeInTheDocument();
    expect(screen.getByText('Add an automated test script')).toBeInTheDocument();
    expect(screen.getByText('Restore CI workflows')).toBeInTheDocument();
    expect(screen.getByText('1 persistent')).toBeInTheDocument();
  });

  test('renders a compact unchanged state without standalone zero deltas', () => {
    render(
      <ReportComparisonPanel
        comparison={{
          ...comparison,
          totalScore: {
            current: 82,
            previous: 82,
            delta: 0,
          },
          metrics: comparison.metrics.map((metric) => ({
            ...metric,
            currentValue: metric.previousValue,
            delta: 0,
          })),
          checks: [],
          recommendations: {
            added: [],
            resolved: [],
            persistentCount: 2,
          },
        }}
      />,
    );

    expect(screen.getByLabelText('Total score delta No change')).toHaveTextContent('No change');
    expect(screen.getByText('No metric changes')).toBeInTheDocument();
    expect(screen.getByText('3 unchanged metrics')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'No changes since previous report' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^0$/u)).not.toBeInTheDocument();
  });

  test('renders manual comparison copy when selected history run is used', () => {
    render(<ReportComparisonPanel comparison={comparison} mode="manual" />);

    expect(
      screen.getByRole('heading', { name: 'Comparison with selected run' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Compare current report with selected history run.'),
    ).toBeInTheDocument();
  });

  test('renders unavailable manual comparison reason', () => {
    render(<ReportComparisonUnavailablePanel reason="different_score_categories" />);

    expect(screen.getByRole('heading', { name: 'Comparison unavailable' })).toBeInTheDocument();
    expect(
      screen.getByText('Frontend Radar could not compare the selected reports.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The selected reports were created with different enabled metric sets.'),
    ).toBeInTheDocument();
  });
});
