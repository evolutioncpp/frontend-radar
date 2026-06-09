import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getReportPath } from '@/shared/config/routes/appRoutes';

import { DashboardHistoryPage } from './DashboardHistoryPage';

const apiMocks = vi.hoisted(() => ({
  listReportAnalyses: vi.fn(),
}));

vi.mock('@/shared/api/generatedApi', () => ({
  useListReportAnalysesQuery: (...args: unknown[]) => apiMocks.listReportAnalyses(...args),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
    },
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'page.title': 'History',
        'page.description':
          'Review repository analysis runs and reopen reports when you need to revisit project health.',
        'page.loadingTitle': 'Loading analysis history',
        'page.loadingDescription': 'Frontend Radar is checking recent repository analysis runs.',
        'page.errorTitle': 'History is unavailable',
        'page.errorDescription': 'The analysis history could not be loaded. Try again in a moment.',
        'page.emptyTitle': 'No analysis history yet',
        'page.emptyDescription': 'Start a repository analysis from the dashboard overview.',
        'card.label': 'Analysis run',
        'card.openReportAria': `Open report for ${options?.repository}`,
        'card.scoreLabel': 'Health score',
        'card.statuses.queued': 'Queued',
        'card.statuses.running': 'Running',
        'card.statuses.completed': 'Completed',
        'card.statuses.failed': 'Failed',
        'card.summary.metrics': 'Metrics',
        'card.summary.checks': 'Checks',
        'card.summary.recommendations': 'Recommendations',
      };

      if (key === 'card.analyzedAt') {
        return `Last activity ${options?.date}`;
      }

      return translations[key] ?? key;
    },
  }),
}));

const renderDashboardHistoryPage = () => {
  return render(
    <MemoryRouter>
      <DashboardHistoryPage />
    </MemoryRouter>,
  );
};

const completedHistoryItem = {
  id: 'analysis-id',
  owner: 'evolutioncpp',
  repository: 'frontend-radar',
  normalizedUrl: 'https://github.com/evolutioncpp/frontend-radar',
  status: 'completed' as const,
  latestCommitDate: '2026-06-09T00:00:00.000Z',
  latestCommitSha: 'abc123',
  createdAt: '2026-06-09T00:00:00.000Z',
  updatedAt: '2026-06-09T00:02:00.000Z',
  score: 82,
  metricsCount: 1,
  checksCount: 1,
  recommendationsCount: 0,
};

const queuedHistoryItem = {
  id: 'queued-analysis-id',
  owner: 'evolutioncpp',
  repository: 'frontend-radar',
  normalizedUrl: 'https://github.com/evolutioncpp/frontend-radar',
  status: 'queued' as const,
  latestCommitDate: '2026-06-09T00:01:00.000Z',
  latestCommitSha: 'def456',
  createdAt: '2026-06-09T00:01:00.000Z',
  updatedAt: '2026-06-09T00:01:00.000Z',
};

const repeatedRepositoryHistoryItem = {
  ...completedHistoryItem,
  id: 'second-analysis-id',
  createdAt: '2026-06-09T00:02:00.000Z',
  updatedAt: '2026-06-09T00:02:00.000Z',
  score: 84,
};

const createHistoryResponse = (
  items: Array<
    typeof completedHistoryItem | typeof queuedHistoryItem | typeof repeatedRepositoryHistoryItem
  >,
) => ({
  data: {
    items,
  },
  isError: false,
  isLoading: false,
});

const expectSummaryItem = (label: string, value: string) => {
  const summaryItem = screen.getByText(label).closest('div');

  expect(summaryItem).not.toBeNull();
  expect(within(summaryItem as HTMLElement).getByText(value)).toBeInTheDocument();
};

describe('DashboardHistoryPage', () => {
  beforeEach(() => {
    apiMocks.listReportAnalyses.mockReturnValue(createHistoryResponse([]));
  });

  test('renders loading state while backend history is loading', () => {
    apiMocks.listReportAnalyses.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    });

    renderDashboardHistoryPage();

    expect(screen.getByRole('heading', { name: 'Loading analysis history' })).toBeInTheDocument();
  });

  test('renders error state when backend history fails', () => {
    apiMocks.listReportAnalyses.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });

    renderDashboardHistoryPage();

    expect(screen.getByRole('heading', { name: 'History is unavailable' })).toBeInTheDocument();
  });

  test('renders empty state without analysis history', () => {
    renderDashboardHistoryPage();

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No analysis history yet' })).toBeInTheDocument();
  });

  test('renders compact history card from backend history', () => {
    apiMocks.listReportAnalyses.mockReturnValue(createHistoryResponse([completedHistoryItem]));

    renderDashboardHistoryPage();

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByText('Analysis run')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'evolutioncpp/frontend-radar' }),
    ).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expectSummaryItem('Metrics', '1');
    expectSummaryItem('Checks', '1');
    expectSummaryItem('Recommendations', '0');
    expect(screen.getByText(/Last activity/i)).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('renders repeated repository runs as separate cards', () => {
    apiMocks.listReportAnalyses.mockReturnValue(
      createHistoryResponse([repeatedRepositoryHistoryItem, completedHistoryItem]),
    );

    renderDashboardHistoryPage();

    expect(screen.getAllByRole('heading', { name: 'evolutioncpp/frontend-radar' })).toHaveLength(2);
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
  });

  test('renders queued analysis run without score', () => {
    apiMocks.listReportAnalyses.mockReturnValue(createHistoryResponse([queuedHistoryItem]));

    renderDashboardHistoryPage();

    expect(screen.getAllByText('Queued')).toHaveLength(2);
    expect(screen.queryByText('/100')).not.toBeInTheDocument();
  });

  test('links to report run', () => {
    apiMocks.listReportAnalyses.mockReturnValue(createHistoryResponse([completedHistoryItem]));

    renderDashboardHistoryPage();

    expect(
      screen.getByRole('link', {
        name: 'Open report for evolutioncpp/frontend-radar',
      }),
    ).toHaveAttribute('href', getReportPath('analysis-id'));
  });
});
