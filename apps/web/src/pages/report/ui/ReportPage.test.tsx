import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AppRoutes } from '@/shared/config/routes/appRoutes';

import { ReportPage } from './ReportPage';

import type { ProjectReport } from '@/entities/report';

const apiMocks = vi.hoisted(() => ({
  createReportAnalysis: vi.fn(),
  getReportAnalysis: vi.fn(),
}));

vi.mock('@/shared/api/generatedApi', () => ({
  useCreateReportAnalysisMutation: () => [apiMocks.createReportAnalysis, { isLoading: false }],
  useGetReportAnalysisQuery: (...args: unknown[]) => apiMocks.getReportAnalysis(...args),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'page.reportAria': 'Dashboard report',
        'page.reportFallback.title': 'Report not found',
        'page.reportFallback.description':
          'This report is not available yet. Start a new analysis from the dashboard overview.',
        'page.reportLoading.title': 'Loading report',
        'page.reportLoading.description': 'Frontend Radar is checking the analysis status.',
        'page.reportProcessing.title': 'Analysis in progress',
        'page.reportProcessing.description':
          'The report is being assembled from GitHub repository signals.',
        'page.reportError.title': 'Analysis failed',
        'page.reportError.description':
          'The report could not be loaded. Try starting a new analysis.',
        'page.reportFailed.title': 'Analysis failed',
        'page.reportFailed.description': 'Repository analysis failed. Try starting a new analysis.',
        'page.reportReuse.completed.title': 'Using the current report',
        'page.reportReuse.completed.description':
          'The repository has not changed since the latest completed analysis, so Frontend Radar reused the existing report.',
        'page.reportReuse.active.title': 'Analysis already in progress',
        'page.reportReuse.active.description':
          'An analysis for this repository commit is already running, so Frontend Radar opened the existing run.',
        'page.reportReuse.retried.title': 'Retrying analysis',
        'page.reportReuse.retried.description':
          'The previous attempt for this repository commit failed, so Frontend Radar restarted the analysis.',
        'page.label': 'Repository analysis',
        'page.title': 'Frontend project health overview',
        'page.description':
          'Analyze repository quality, tooling, testing, documentation and delivery readiness in a single dashboard.',
        'page.sections.repository': 'Repository summary',
        'page.sections.healthScore': 'Health score',
        'page.sections.metrics': 'Quality metrics',
        'page.sections.checks': 'Project checks',
        'page.sections.recommendations': 'Recommendations',
        'page.copySectionTitle': 'Copy section link',
        'page.copied': 'Copied',

        'repository.label': 'Repository',
        'repository.openRepository': 'Open repository',
        'repository.metadataAria': 'Repository metadata',
        'repository.metadata.stars': 'Stars',
        'repository.metadata.forks': 'Forks',
        'repository.metadata.branch': 'Branch',
        'repository.metadata.license': 'License',
        'repository.metadata.unknown': 'Unknown',

        'healthScore.label': 'Frontend Health Score',
        'healthScore.title': 'Overall project quality',
        'healthScore.description':
          'This score summarizes repository setup, documentation, testing, CI/CD, dependencies and maintainability signals.',
        'healthScore.progressAria': 'Frontend health score progress',

        'metrics.label': 'Score breakdown',
        'metrics.title': 'Quality metrics',
        'metrics.listAria': 'Metrics list',

        'checks.label': 'Project checks',
        'checks.title': 'Quality signals',
        'checks.listAria': 'Project checks list',

        'recommendations.label': 'Next steps',
        'recommendations.title': 'Recommendations',
        'recommendations.listAria': 'Recommendations list',
        'recommendations.empty': 'No recommendations for now.',

        'statuses.excellent': 'Excellent',
        'statuses.good': 'Good',
        'statuses.warning': 'Warning',
        'statuses.critical': 'Critical',
        'statuses.passed': 'Passed',
        'statuses.failed': 'Failed',
        'statuses.high': 'High',
        'statuses.medium': 'Medium',
        'statuses.low': 'Low',
        'evidence.title': 'Evidence',
        'evidence.statuses.found': 'Found',
        'evidence.statuses.missing': 'Missing',
        'evidence.statuses.warning': 'Warning',

        'form.label': 'Repository',
        'form.placeholder': 'https://github.com/owner/repo',
        'form.hint': 'Paste a GitHub repository URL or owner/repo.',
        'form.clear': 'Clear repository',
        'form.submit': 'Analyze',
        'form.submitLoading': 'Checking...',
        'form.errors.invalidRepository': 'Enter a valid GitHub repository.',
        'form.errors.repositoryNotFound': 'Repository was not found on GitHub.',
        'form.errors.repositoryForbidden':
          'This repository is private or GitHub access is forbidden.',
        'form.errors.githubRateLimited': 'GitHub rate limit was reached. Try again later.',
        'form.errors.githubUnavailable': 'GitHub is unavailable right now. Try again later.',
        'form.errors.repositoryVerificationFailed':
          'GitHub could not verify this repository. Try again in a moment.',
        'form.errors.unknown': 'Could not start repository analysis. Try again.',
      };

      if (key === 'page.copySectionLink') {
        return `Copy link to ${options?.section} section`;
      }

      if (key === 'evidence.source') {
        return `Source: ${options?.source}`;
      }

      if (key === 'healthScore.scoreAria') {
        return `Frontend health score ${options?.score} out of 100`;
      }

      if (key === 'metrics.counter') {
        return `${options?.count} ${options?.count === 1 ? 'metric' : 'metrics'}`;
      }

      if (key === 'checks.counter') {
        return `${options?.count} ${options?.count === 1 ? 'check' : 'checks'}`;
      }

      if (key === 'recommendations.counter') {
        return `${options?.count} ${options?.count === 1 ? 'recommendation' : 'recommendations'}`;
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

const testReport: ProjectReport = {
  id: 'analysis-id',
  createdAt: '2026-06-09T00:00:00.000Z',
  totalScore: 82,
  repository: {
    owner: 'evolutioncpp',
    name: 'frontend-radar',
    url: 'https://github.com/evolutioncpp/frontend-radar',
    description: 'Frontend dashboard',
    stars: 128,
    forks: 14,
    defaultBranch: 'main',
    latestCommitSha: 'abc123',
    latestCommitDate: '2026-06-09T00:00:00.000Z',
    license: 'MIT',
  },
  scoreBreakdown: [
    {
      category: 'documentation',
      label: 'Documentation',
      value: 82,
      maxValue: 100,
      status: 'good',
      description: 'Documentation signals.',
      evidence: [
        {
          id: 'readme',
          label: 'README',
          status: 'found',
          source: 'README',
        },
      ],
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      label: 'README exists',
      status: 'passed',
    },
  ],
  recommendations: [],
};

const renderReportPage = (initialEntry: string | { pathname: string; state?: unknown }) => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ReportPage />} path={AppRoutes.REPORT} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ReportPage', () => {
  beforeEach(() => {
    apiMocks.createReportAnalysis.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'next-analysis-id', status: 'queued' }),
    });
    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        report: testReport,
        status: 'completed',
      },
      isError: false,
      isLoading: false,
    });
  });

  test('renders completed report', () => {
    renderReportPage('/dashboard/report/analysis-id');

    expect(
      screen.getByRole('heading', { name: 'Frontend project health overview' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Repository' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Overall project quality' })).toBeInTheDocument();
  });

  test('renders completed reuse notice from navigation state', () => {
    renderReportPage({
      pathname: '/dashboard/report/analysis-id',
      state: {
        reportAnalysisReuseReason: 'completed',
      },
    });

    expect(screen.getByRole('status')).toHaveTextContent('Using the current report');
    expect(screen.getByText(/reused the existing report/i)).toBeInTheDocument();
  });

  test('renders loading state', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    });

    renderReportPage('/dashboard/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Loading report' })).toBeInTheDocument();
    expect(screen.getByText(/checking the analysis status/i)).toBeInTheDocument();
  });

  test('renders processing state', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        status: 'running',
      },
      isError: false,
      isLoading: false,
    });

    renderReportPage('/dashboard/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Analysis in progress' })).toBeInTheDocument();
    expect(screen.getByText(/being assembled/i)).toBeInTheDocument();
  });

  test('renders fallback for unknown report id', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      error: {
        status: 404,
      },
      isError: true,
      isLoading: false,
    });

    renderReportPage('/dashboard/report/unknown');

    expect(
      screen.getByRole('heading', { name: 'Frontend project health overview' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Repository' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Report not found' })).toBeInTheDocument();
    expect(screen.getByText(/This report is not available yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/evolutioncpp\/frontend-radar/i)).not.toBeInTheDocument();
  });

  test('renders error state', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      error: {
        status: 500,
      },
      isError: true,
      isLoading: false,
    });

    renderReportPage('/dashboard/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Analysis failed' })).toBeInTheDocument();
    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
  });

  test('renders failed analysis state', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        status: 'failed',
        errorCode: 'github_unavailable',
        errorMessage: 'GitHub is unavailable right now. Try again later.',
      },
      isError: false,
      isLoading: false,
    });

    renderReportPage('/dashboard/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Analysis failed' })).toBeInTheDocument();
    expect(screen.getByText(/GitHub is unavailable/i)).toBeInTheDocument();
  });
});
