import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AppRoutes } from '@/shared/config/routes/appRoutes';

import { DashboardPage } from './DashboardPage';

const apiMocks = vi.hoisted(() => ({
  createReportAnalysis: vi.fn(),
}));

const repositoryBranchesResponse = vi.hoisted(() => ({
  defaultBranch: 'main',
  branches: [
    {
      isDefault: true,
      name: 'main',
    },
  ],
  isTruncated: false,
}));

vi.mock('@/shared/api/generatedApi', () => ({
  useCreateReportAnalysisMutation: () => [apiMocks.createReportAnalysis, { isLoading: false }],
  useLazyListRepositoryBranchesQuery: () => [
    vi.fn(() => ({
      unwrap: () => Promise.resolve(repositoryBranchesResponse),
    })),
    {
      data: repositoryBranchesResponse,
    },
  ],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'page.label': 'Repository analysis',
        'page.title': 'Frontend project health overview',
        'page.description':
          'Analyze repository quality, tooling, testing, documentation and delivery readiness in a single dashboard.',
        'page.analysisInfo.title': 'How the analysis works',
        'page.analysisInfo.description':
          'The report is assembled from repository data, bounded source scans, workflow checks and the metric set enabled in settings.',
        'page.analysisInfo.steps.repository.title': 'Read the repository and frontend path',
        'page.analysisInfo.steps.repository.description':
          'Frontend Radar starts with GitHub metadata, the selected branch, package metadata and project files that describe the frontend entry point.',
        'page.analysisInfo.steps.repository.detailsTitle': 'Used as input',
        'page.analysisInfo.steps.repository.details.package': 'package.json',
        'page.analysisInfo.steps.repository.details.path': 'Frontend path',
        'page.analysisInfo.steps.repository.details.readme': 'README',
        'page.analysisInfo.steps.repository.details.branch': 'Branch and commit',
        'page.analysisInfo.steps.signals.title': 'Scan source code and configs',
        'page.analysisInfo.steps.signals.description':
          'The analyzer reads a bounded set of source, test and config files to detect TypeScript quality, test coverage and maintainability signals.',
        'page.analysisInfo.steps.signals.detailsTitle': 'Checked signals',
        'page.analysisInfo.steps.signals.details.source': 'Source files',
        'page.analysisInfo.steps.signals.details.typescript': 'TypeScript configs',
        'page.analysisInfo.steps.signals.details.tests': 'Tests and coverage',
        'page.analysisInfo.steps.signals.details.codeHealth': 'Code health hints',
        'page.analysisInfo.steps.metrics.title': 'Check delivery and security signals',
        'page.analysisInfo.steps.metrics.description':
          'Frontend Radar checks dependency hygiene, GitHub Actions workflows and basic secret hygiene before building the final score.',
        'page.analysisInfo.steps.metrics.detailsTitle': 'Extra checks',
        'page.analysisInfo.steps.metrics.details.dependencies': 'Lockfiles and package manager',
        'page.analysisInfo.steps.metrics.details.ci': 'CI install, lint, test and build',
        'page.analysisInfo.steps.metrics.details.security': 'Secrets, env files and gitignore',
        'page.analysisInfo.steps.metrics.details.settings': 'Enabled metrics from settings',
        'page.analysisInfo.steps.recommendations.title': 'Build the score and next steps',
        'page.analysisInfo.steps.recommendations.description':
          'The final report explains the weighted score and turns weak checks into practical recommendations with impact and effort labels.',
        'page.analysisInfo.steps.recommendations.detailsTitle': 'Report output',
        'page.analysisInfo.steps.recommendations.details.score': 'Weighted health score',
        'page.analysisInfo.steps.recommendations.details.reasons': 'Reasons behind each metric',
        'page.analysisInfo.steps.recommendations.details.actions': 'Actionable recommendations',
        'page.analysisInfo.steps.recommendations.details.history': 'History and comparison',

        'form.label': 'Repository',
        'form.placeholder': 'https://github.com/owner/repo',
        'form.hint': 'Paste a GitHub repository URL or owner/repo.',
        'form.clear': 'Clear repository',
        'form.submit': 'Analyze',
        'form.submitLoading': 'Checking...',
        'form.errors.invalidRepository': 'Enter a valid GitHub repository.',
        'form.errors.repositoryNotFound':
          'Repository was not found on GitHub, or the configured token does not have access to a private repository.',
        'form.errors.repositoryForbidden':
          'This repository is private or GitHub access is forbidden.',
        'form.errors.githubRateLimited': 'GitHub rate limit was reached. Try again later.',
        'form.errors.githubUnavailable': 'GitHub is unavailable right now. Try again later.',
        'form.errors.serviceUnavailable':
          'Frontend Radar API is unavailable. Check that the backend and database are running, then try again.',
        'form.errors.repositoryVerificationFailed':
          'GitHub could not verify this repository. Try again in a moment.',
        'form.errors.unknown': 'Could not start repository analysis. Try again.',
      };

      return translations[key] ?? key;
    },
  }),
}));

const renderDashboardPage = (initialEntry = AppRoutes.DASHBOARD) => {
  const appSettings = {
    theme: 'dark',
    language: 'en',
    isDashboardSidebarCollapsed: false,
    isReportHistoryEnabled: true,
    enabledScoreCategories: [
      'documentation',
      'testing',
      'ci',
      'dependencies',
      'security',
      'maintainability',
      'performance',
      'accessibility',
    ],
  };
  const store = configureStore({
    reducer: {
      appSettings: (state = appSettings) => state,
    },
    preloadedState: {
      appSettings,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<DashboardPage />} path={AppRoutes.DASHBOARD} />
          <Route element={<h1>Demo report route</h1>} path={AppRoutes.REPORT} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    apiMocks.createReportAnalysis.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'analysis-id', status: 'queued' }),
    });
  });

  test('renders analysis form and info card', () => {
    renderDashboardPage();

    expect(
      screen.getByRole('heading', { name: 'Frontend project health overview' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Repository')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How the analysis works' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Check delivery and security signals' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Used as input')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  test('does not render demo report content by default', () => {
    renderDashboardPage();

    expect(screen.queryByText(/evolutioncpp\/frontend-radar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Frontend Health Score/i)).not.toBeInTheDocument();
  });

  test('creates analysis and navigates to report after valid submit', async () => {
    renderDashboardPage();

    fireEvent.change(screen.getByLabelText('Repository'), {
      target: {
        value: 'https://github.com/evolutioncpp/frontend-radar',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo report route' })).toBeInTheDocument();
    });
    expect(apiMocks.createReportAnalysis).toHaveBeenCalledWith({
      body: {
        owner: 'evolutioncpp',
        repository: 'frontend-radar',
        normalizedUrl: 'https://github.com/evolutioncpp/frontend-radar',
        saveToHistory: true,
        enabledScoreCategories: [
          'documentation',
          'testing',
          'ci',
          'dependencies',
          'security',
          'maintainability',
          'performance',
          'accessibility',
        ],
      },
    });
  });

  test('shows repository not found error without navigating', async () => {
    const repositoryNotFoundError = Object.assign(new Error('Repository was not found'), {
      status: 404,
    });

    apiMocks.createReportAnalysis.mockReturnValue({
      unwrap: () => Promise.reject(repositoryNotFoundError),
    });
    renderDashboardPage();

    fireEvent.change(screen.getByLabelText('Repository'), {
      target: {
        value: 'https://github.com/facebook/missing-repo',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Repository was not found on GitHub, or the configured token does not have access to a private repository.',
        ),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: 'Demo report route' })).not.toBeInTheDocument();
  });

  test('shows rate limit error from backend code without navigating', async () => {
    const rateLimitError = Object.assign(new Error('Rate limited'), {
      data: {
        code: 'github_rate_limited',
      },
      status: 429,
    });

    apiMocks.createReportAnalysis.mockReturnValue({
      unwrap: () => Promise.reject(rateLimitError),
    });
    renderDashboardPage();

    fireEvent.change(screen.getByLabelText('Repository'), {
      target: {
        value: 'https://github.com/facebook/react',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(
        screen.getByText('GitHub rate limit was reached. Try again later.'),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: 'Demo report route' })).not.toBeInTheDocument();
  });

  test('shows service unavailable error when backend cannot be reached', async () => {
    apiMocks.createReportAnalysis.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('API unavailable'), {
            status: 'FETCH_ERROR',
          }),
        ),
    });
    renderDashboardPage();

    fireEvent.change(screen.getByLabelText('Repository'), {
      target: {
        value: 'https://github.com/facebook/react',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Frontend Radar API is unavailable. Check that the backend and database are running, then try again.',
        ),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: 'Demo report route' })).not.toBeInTheDocument();
  });
});
