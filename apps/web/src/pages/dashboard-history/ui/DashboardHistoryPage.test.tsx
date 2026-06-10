import { fireEvent, render, screen, within } from '@testing-library/react';
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
        'card.latestRunLabel': 'Latest analysis run',
        'card.openReportAria': `Open report for ${options?.repository}`,
        'card.scoreLabel': 'Health score',
        'card.statuses.queued': 'Queued',
        'card.statuses.running': 'Running',
        'card.statuses.completed': 'Completed',
        'card.statuses.failed': 'Failed',
        'card.summary.metrics': 'Metrics',
        'card.summary.checks': 'Checks',
        'card.summary.recommendations': 'Recommendations',
        'group.hidePreviousRuns': 'Hide previous runs',
        'group.previousRunsLabel': 'Previous runs',
        'group.openPreviousRunAria': `Open previous report for ${options?.repository} from ${options?.date}`,
        'group.compareWithLatest': 'Compare with latest',
      };

      if (key === 'card.analyzedAt') {
        return `Last activity ${options?.date}`;
      }

      if (key === 'group.runCount') {
        return `${options?.count} runs`;
      }

      if (key === 'group.showPreviousRuns') {
        return Number(options?.count) === 1
          ? 'Show previous run'
          : `Show previous runs (${options?.count})`;
      }

      if (key === 'group.compareWithLatestAria') {
        return `Compare latest report for ${options?.repository} with previous run from ${options?.date}`;
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
  branch: 'main',
  projectPath: null as string | null,
  status: 'completed' as const,
  latestCommitDate: '2026-06-09T00:00:00.000Z',
  latestCommitSha: 'abc123',
  latestCommitTitle: 'Add frontend radar dashboard',
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
  branch: 'main',
  projectPath: null as string | null,
  status: 'queued' as const,
  latestCommitDate: '2026-06-09T00:01:00.000Z',
  latestCommitSha: 'def456',
  latestCommitTitle: 'Queue frontend radar analysis',
  createdAt: '2026-06-09T00:01:00.000Z',
  updatedAt: '2026-06-09T00:01:00.000Z',
};

const repeatedRepositoryHistoryItem = {
  ...completedHistoryItem,
  id: 'second-analysis-id',
  createdAt: '2026-06-09T00:02:00.000Z',
  latestCommitTitle: 'Improve history grouping',
  updatedAt: '2026-06-09T00:03:00.000Z',
  score: 84,
};

const differentProjectPathHistoryItem = {
  ...completedHistoryItem,
  id: 'docs-analysis-id',
  projectPath: 'apps/docs',
  updatedAt: '2026-06-09T00:04:00.000Z',
  score: 76,
};

const createHistoryResponse = (
  items: Array<
    | typeof completedHistoryItem
    | typeof queuedHistoryItem
    | typeof repeatedRepositoryHistoryItem
    | typeof differentProjectPathHistoryItem
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
    expect(screen.getByText('Latest analysis run')).toBeInTheDocument();
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
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('Add frontend radar dashboard')).toBeInTheDocument();
  });

  test('renders project path for nested frontend history item', () => {
    apiMocks.listReportAnalyses.mockReturnValue(
      createHistoryResponse([{ ...completedHistoryItem, projectPath: 'apps/web' }]),
    );

    renderDashboardHistoryPage();

    expect(screen.getByText('apps/web')).toBeInTheDocument();
  });

  test('groups repeated repository runs and reveals previous runs on demand', () => {
    apiMocks.listReportAnalyses.mockReturnValue(
      createHistoryResponse([repeatedRepositoryHistoryItem, completedHistoryItem]),
    );

    renderDashboardHistoryPage();

    expect(screen.getAllByRole('heading', { name: 'evolutioncpp/frontend-radar' })).toHaveLength(1);
    expect(screen.getByText('2 runs')).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.queryByText('82')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show previous run' }));

    expect(screen.getByText('Previous runs')).toBeInTheDocument();
    expect(screen.getByText('82/100')).toBeInTheDocument();
    expect(screen.getByText('Add frontend radar dashboard')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Open previous report for evolutioncpp\/frontend-radar/i,
      }),
    ).toHaveAttribute('href', getReportPath('analysis-id'));
    expect(
      screen.getByRole('link', {
        name: /Compare latest report for evolutioncpp\/frontend-radar/i,
      }),
    ).toHaveAttribute(
      'href',
      getReportPath('second-analysis-id', {
        compareWith: 'analysis-id',
      }),
    );
    expect(screen.getByText('Compare with latest')).toBeInTheDocument();
  });

  test('hides compare action when latest run is not completed', () => {
    apiMocks.listReportAnalyses.mockReturnValue(
      createHistoryResponse([
        {
          ...queuedHistoryItem,
          updatedAt: '2026-06-09T00:05:00.000Z',
        },
        completedHistoryItem,
      ]),
    );

    renderDashboardHistoryPage();

    fireEvent.click(screen.getByRole('button', { name: 'Show previous run' }));

    expect(
      screen.queryByRole('link', {
        name: /Compare latest report for evolutioncpp\/frontend-radar/i,
      }),
    ).not.toBeInTheDocument();
  });

  test('renders different project paths as separate groups', () => {
    apiMocks.listReportAnalyses.mockReturnValue(
      createHistoryResponse([
        differentProjectPathHistoryItem,
        { ...completedHistoryItem, projectPath: 'apps/web' },
      ]),
    );

    renderDashboardHistoryPage();

    expect(screen.getAllByRole('heading', { name: 'evolutioncpp/frontend-radar' })).toHaveLength(2);
    expect(screen.getByText('apps/docs')).toBeInTheDocument();
    expect(screen.getByText('apps/web')).toBeInTheDocument();
  });

  test('renders different branches as separate groups', () => {
    apiMocks.listReportAnalyses.mockReturnValue(
      createHistoryResponse([
        completedHistoryItem,
        {
          ...completedHistoryItem,
          branch: 'develop',
          id: 'develop-analysis-id',
          updatedAt: '2026-06-09T00:04:00.000Z',
        },
      ]),
    );

    renderDashboardHistoryPage();

    expect(screen.getAllByRole('heading', { name: 'evolutioncpp/frontend-radar' })).toHaveLength(2);
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('develop')).toBeInTheDocument();
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
