import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AppRoutes } from '@/shared/config/routes/appRoutes';

import { ReportPage } from './ReportPage';

import type { ProjectReport } from '@/entities/report';

const emptyTooling: ProjectReport['tooling'] = {
  accessibility: [],
  bundlers: [],
  formatting: [],
  frameworks: [],
  linting: [],
  packageManager: [],
  testing: [],
  typing: [],
  uiReview: [],
};

const createScoreDetails = (
  value: number,
): ProjectReport['scoreBreakdown'][number]['scoreDetails'] => ({
  rawValue: value,
  finalValue: value,
  weight: 10,
  impactLevel: 'supporting',
  checks: [
    {
      id: 'readme',
      label: 'README',
      status: 'passed',
      severity: 'major',
      scope: 'repository',
      confidence: 'high',
      earned: value,
      max: 100,
      source: 'README',
    },
  ],
});

const apiMocks = vi.hoisted(() => ({
  createReportAnalysis: vi.fn(),
  forceRefreshReportAnalysis: vi.fn(),
  getReportComparison: vi.fn(),
  getReportAnalysis: vi.fn(),
  retryReportAnalysis: vi.fn(),
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
  useForceRefreshReportAnalysisMutation: () => [
    apiMocks.forceRefreshReportAnalysis,
    { isLoading: false },
  ],
  useRetryReportAnalysisMutation: () => [apiMocks.retryReportAnalysis, { isLoading: false }],
  useGetReportComparisonQuery: (...args: unknown[]) => apiMocks.getReportComparison(...args),
  useGetReportAnalysisQuery: (...args: unknown[]) => apiMocks.getReportAnalysis(...args),
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
    i18n: {
      language: 'en',
    },
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'page.reportAria': 'Dashboard report',
        'page.reportFallback.title': 'Report not found',
        'page.reportFallback.description':
          'This report is not available yet. Start a new analysis from the dashboard overview.',
        'page.reportLoading.title': 'Loading report',
        'page.reportLoading.description': 'Frontend Radar is checking the analysis status.',
        'page.reportLoading.spinnerLabel': 'Loading report',
        'page.reportProcessing.label': 'Repository analysis',
        'page.reportProcessing.title': 'Analysis in progress',
        'page.reportProcessing.description':
          'The report is being assembled from GitHub repository signals.',
        'page.reportProcessing.repository': 'Repository',
        'page.reportProcessing.polling': 'Updating automatically',
        'page.reportProcessing.spinnerLabel': 'Repository analysis is in progress',
        'page.reportProcessing.stepsLabel': 'Analysis progress',
        'page.reportProcessing.statuses.queued': 'Analysis is queued',
        'page.reportProcessing.statuses.running': 'Analysis in progress',
        'page.reportProcessing.metadata.branch': 'Branch',
        'page.reportProcessing.metadata.projectPath': 'Frontend path',
        'page.reportProcessing.metadata.commit': 'Commit',
        'page.reportProcessing.metadata.startedAt': 'Started',
        'page.reportProcessing.metadata.progressUpdatedAt': 'Stage updated',
        'page.reportProcessing.currentStage': 'Current stage',
        'page.reportProcessing.staleHint':
          'This stage is taking longer than usual. GitHub may be responding slowly, and the page is still updating automatically.',
        'page.reportProcessing.steps.queued': 'Waiting for processing',
        'page.reportProcessing.steps.starting': 'Starting worker',
        'page.reportProcessing.steps.repository_metadata': 'Reading repository metadata',
        'page.reportProcessing.steps.project_detection': 'Selecting frontend folder',
        'page.reportProcessing.steps.repository_signals': 'Reading project signals',
        'page.reportProcessing.steps.source_scan': 'Scanning source code',
        'page.reportProcessing.steps.workflow_analysis': 'Analyzing workflows',
        'page.reportProcessing.steps.security_scan': 'Checking secrets',
        'page.reportProcessing.steps.scoring': 'Calculating score',
        'page.reportProcessing.steps.report_building': 'Preparing report',
        'page.reportProcessing.stepDescriptions.queued':
          'The analysis task has been created and is waiting for a worker.',
        'page.reportProcessing.stepDescriptions.starting':
          'A worker has claimed the task and is preparing the analysis.',
        'page.reportProcessing.stepDescriptions.repository_metadata':
          'Frontend Radar is loading repository metadata and commit information from GitHub.',
        'page.reportProcessing.stepDescriptions.project_detection':
          'Frontend Radar is checking which folder should be analyzed as the frontend project.',
        'page.reportProcessing.stepDescriptions.repository_signals':
          'Frontend Radar is reading package metadata, configs, workflows and repository files.',
        'page.reportProcessing.stepDescriptions.source_scan':
          'Frontend Radar is scanning bounded source, test and TypeScript config files.',
        'page.reportProcessing.stepDescriptions.workflow_analysis':
          'Frontend Radar is reading GitHub Actions workflows and checking CI coverage.',
        'page.reportProcessing.stepDescriptions.security_scan':
          'Frontend Radar is checking secret hygiene, env files and gitignore coverage.',
        'page.reportProcessing.stepDescriptions.scoring':
          'Frontend Radar is converting collected signals into category scores.',
        'page.reportProcessing.stepDescriptions.report_building':
          'Frontend Radar is assembling the final report.',
        'page.reportError.title': 'Report could not be loaded',
        'page.reportError.description':
          'Frontend Radar could not load this report. You can start a new analysis from the form above.',
        'page.reportServiceUnavailable.title': 'Frontend Radar API is unavailable',
        'page.reportServiceUnavailable.description':
          'The backend or database is not reachable right now. Check that local services are running and try again.',
        'page.reportStatusAction': 'Start a new analysis',
        'page.reportStatusActionLoading': 'Starting analysis...',
        'page.reportRetry.error.title': 'Could not restart analysis',
        'page.reportRetry.error.description':
          'Frontend Radar could not restart this analysis. Try again later or start a new analysis manually.',
        'page.reportFailed.title': 'Analysis failed',
        'page.reportFailed.description':
          'Repository analysis failed. Start a new analysis when you are ready.',
        'page.reportFailed.errors.githubUnavailable.title': 'Could not reach GitHub',
        'page.reportFailed.errors.githubUnavailable.description':
          'GitHub API did not respond during analysis. Check the connection, token access or try again later.',
        'page.reportFailed.errors.branchNotFound.title': 'Branch was not found',
        'page.reportFailed.errors.branchNotFound.description':
          'The selected branch is no longer available on GitHub. Choose an existing branch and start a new analysis.',
        'page.reportReuse.completed.title': 'Using the current report',
        'page.reportReuse.completed.description':
          'The repository has not changed since the latest completed analysis, so Frontend Radar reused the existing report.',
        'page.reportReuse.active.title': 'Analysis already in progress',
        'page.reportReuse.active.description':
          'An analysis for this repository commit is already running, so Frontend Radar opened the existing run.',
        'page.reportReuse.retried.title': 'Retrying analysis',
        'page.reportReuse.retried.description':
          'The previous attempt for this repository commit failed, so Frontend Radar restarted the analysis.',
        'page.reportRefresh.upToDate.title': 'Report is up to date',
        'page.reportRefresh.upToDate.description':
          'The repository latest commit has not changed, so no new analysis run was created.',
        'page.reportRefresh.error.title': 'Refresh failed',
        'page.reportRefresh.error.description':
          'Frontend Radar could not check the latest repository commit. Try again later.',
        'page.label': 'Repository analysis',
        'page.title': 'Frontend project health overview',
        'page.description':
          'Analyze repository quality, tooling, testing, documentation and delivery readiness in a single dashboard.',
        'page.sections.repository': 'Repository summary',
        'page.sections.analysisDetails': 'Analysis details',
        'page.sections.healthScore': 'Health score',
        'page.sections.comparison': 'Report comparison',
        'page.sections.metrics': 'Quality metrics',
        'page.sections.checks': 'Project checks',
        'page.sections.recommendations': 'Recommendations',
        'page.copySectionTitle': 'Copy section link',
        'page.copied': 'Copied',
        'reportExport.button': 'Download report',
        'reportExport.buttonAria': 'Download report as Markdown',

        'repository.label': 'Repository',
        'repository.openRepository': 'Open repository',
        'repository.refresh': 'Refresh',
        'repository.refreshLoading': 'Checking...',
        'repository.metadataAria': 'Repository metadata',
        'repository.metadata.stars': 'Stars',
        'repository.metadata.forks': 'Forks',
        'repository.metadata.branch': 'Branch',
        'repository.metadata.projectPath': 'Frontend path',
        'repository.metadata.license': 'License',
        'repository.metadata.unknown': 'Unknown',
        'repository.projectDetection.title': 'Why this frontend path',
        'repository.projectDetection.source': 'Path source',
        'repository.projectDetection.packageJsonPath': 'Package metadata',
        'repository.projectDetection.confidence': 'Detection confidence',
        'repository.projectDetection.sources.autodetect': 'Detected automatically',
        'repository.projectDetection.sources.url': 'From repository input',
        'repository.projectDetection.sources.manual': 'Specified manually',
        'repository.projectDetection.confidenceLevels.high': 'High',
        'repository.projectDetection.confidenceLevels.medium': 'Medium',
        'repository.projectDetection.confidenceLevels.low': 'Low',

        'analysisDetails.label': 'Analysis details',
        'analysisDetails.title': 'Project stack and sources',
        'analysisDetails.empty': 'Not detected',
        'analysisDetails.statuses.found': 'Found',
        'analysisDetails.statuses.missing': 'Missing',
        'analysisDetails.statuses.warning': 'Needs review',
        'analysisDetails.tooling.title': 'Project stack',
        'analysisDetails.tooling.groups.packageManager': 'Package manager',
        'analysisDetails.tooling.groups.frameworks': 'Framework',
        'analysisDetails.tooling.groups.bundlers': 'Bundler',
        'analysisDetails.tooling.groups.testing': 'Testing',
        'analysisDetails.tooling.groups.linting': 'Linting',
        'analysisDetails.tooling.groups.formatting': 'Formatting',
        'analysisDetails.tooling.groups.typing': 'Typing',
        'analysisDetails.tooling.groups.uiReview': 'UI review',
        'analysisDetails.tooling.groups.accessibility': 'Accessibility',
        'analysisDetails.sources.title': 'Analysis sources',
        'analysisDetails.sources.scopes.project': 'Project',
        'analysisDetails.sources.scopes.root': 'Repository root',
        'analysisDetails.sources.scopes.repository': 'Repository',
        'analysisDetails.sources.scopes.github': 'GitHub',

        'healthScore.label': 'Frontend Health Score',
        'healthScore.title': 'Overall project quality',
        'healthScore.description':
          'This weighted score combines category checks and risk caps, so critical gaps can limit the final score even when other signals are strong.',
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

        'comparison.label': 'Comparison',
        'comparison.title': 'Changes since previous report',
        'comparison.manualTitle': 'Comparison with selected run',
        'comparison.description':
          'Compare the current completed report with the previous completed report for the same repository.',
        'comparison.manualDescription':
          'Compare the current completed report with the selected previous run from history.',
        'comparison.unavailable.title': 'Comparison unavailable',
        'comparison.unavailable.description':
          'Frontend Radar could not compare the selected reports.',
        'comparison.unavailable.reasons.default':
          'The selected baseline is not available for this report.',
        'comparison.unavailable.reasons.differentScoreCategories':
          'The selected reports were created with different enabled metric sets.',
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

        'statuses.excellent': 'Excellent',
        'statuses.good': 'Good',
        'statuses.warning': 'Warning',
        'statuses.critical': 'Critical',
        'statuses.passed': 'Passed',
        'statuses.failed': 'Failed',
        'statuses.high': 'High',
        'statuses.medium': 'Medium',
        'statuses.low': 'Low',
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

        'form.label': 'Repository',
        'form.placeholder': 'https://github.com/owner/repo',
        'form.hint': 'Paste a GitHub repository URL or owner/repo.',
        'form.clear': 'Clear repository',
        'form.submit': 'Analyze',
        'form.submitLoading': 'Checking...',
        'form.projectPathToggle': 'Specify frontend path',
        'form.projectPathToggleHint': 'Use this when the frontend app lives inside a monorepo.',
        'form.projectPathLabel': 'Frontend path',
        'form.projectPathPlaceholder': 'apps/web',
        'form.projectPathHint': 'Repo-relative folder that contains the frontend package.json.',
        'form.projectPathClear': 'Clear frontend path',
        'form.errors.invalidRepository': 'Enter a valid GitHub repository.',
        'form.errors.invalidProjectPath': 'Enter a valid frontend folder path.',
        'form.errors.repositoryNotFound':
          'Repository was not found on GitHub, or the configured token does not have access to a private repository.',
        'form.errors.repositoryForbidden':
          'This repository is private or GitHub access is forbidden.',
        'form.errors.projectPathNotFound':
          'Frontend package.json was not found in the selected path.',
        'form.errors.githubRateLimited': 'GitHub rate limit was reached. Try again later.',
        'form.errors.githubUnavailable': 'GitHub is unavailable right now. Try again later.',
        'form.errors.serviceUnavailable':
          'Frontend Radar API is unavailable. Check that the backend and database are running, then try again.',
        'form.errors.repositoryVerificationFailed':
          'GitHub could not verify this repository. Try again in a moment.',
        'form.errors.unknown': 'Could not start repository analysis. Try again.',
      };

      if (key === 'page.copySectionLink') {
        return `Copy link to ${options?.section} section`;
      }

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

      if (key === 'scoreDetails.source') {
        return `Source: ${options?.source}`;
      }

      if (key === 'scoreDetails.points') {
        return `${options?.earned}/${options?.max}`;
      }

      if (key === 'scoreDetails.cap.title') {
        return `Score capped at ${options?.value}`;
      }

      if (key === 'repository.projectDetection.signalSource') {
        return `Source: ${options?.source}`;
      }

      if (key === 'analysisDetails.sources.counter') {
        return `${options?.count} sources`;
      }

      if (key === 'analysisDetails.sources.source') {
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
  analysisSources: [
    {
      id: 'github-repository',
      kind: 'github_api',
      label: 'GitHub repository metadata',
      scope: 'github',
      status: 'found',
      source: 'repos/evolutioncpp/frontend-radar',
    },
  ],
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
    branch: 'main',
    projectPath: null,
    projectDetection: {
      source: 'autodetect',
      path: null,
      packageJsonPath: 'package.json',
      confidence: 'high',
      signals: [
        {
          id: 'project-package-json',
          label: 'Frontend package.json',
          status: 'found',
          source: 'package.json',
        },
      ],
    },
    latestCommitSha: 'abc123',
    latestCommitDate: '2026-06-09T00:00:00.000Z',
    latestCommitTitle: 'Add frontend report page',
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
      scoreDetails: createScoreDetails(82),
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
  tooling: {
    ...emptyTooling,
    frameworks: [
      {
        id: 'react',
        label: 'React',
        sources: [
          {
            detail: 'package.json / dependencies',
            kind: 'dependency',
            label: 'react',
            name: 'react',
            path: 'package.json',
            raw: 'package.json dependencies.react',
            section: 'dependencies',
          },
        ],
        status: 'found',
      },
    ],
  },
};

const processingAnalysis = {
  owner: 'evolutioncpp',
  repository: 'frontend-radar',
  normalizedUrl: 'https://github.com/evolutioncpp/frontend-radar',
  branch: 'main',
  projectPath: 'apps/web',
  latestCommitSha: 'abc123',
  latestCommitDate: '2026-06-09T00:00:00.000Z',
  latestCommitTitle: 'Add frontend report page',
  progress: {
    stage: 'source_scan',
    updatedAt: '2099-06-09T00:01:00.000Z',
  },
  startedAt: '2026-06-09T00:00:30.000Z',
  createdAt: '2026-06-09T00:00:00.000Z',
  updatedAt: '2026-06-09T00:01:00.000Z',
};

const createTestStore = () => {
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

  return configureStore({
    reducer: {
      appSettings: (state = appSettings) => state,
    },
    preloadedState: {
      appSettings,
    },
  });
};

const renderReportPage = (initialEntry: string | { pathname: string; state?: unknown }) => {
  const store = createTestStore();

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<ReportPage />} path={AppRoutes.REPORT} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const LocationProbe = () => {
  const location = useLocation();

  return <span data-testid="location">{location.pathname}</span>;
};

const renderReportPageWithLocation = (
  initialEntry: string | { pathname: string; state?: unknown },
) => {
  const store = createTestStore();

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <LocationProbe />
        <Routes>
          <Route element={<ReportPage />} path={AppRoutes.REPORT} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('ReportPage', () => {
  beforeEach(() => {
    apiMocks.createReportAnalysis.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'next-analysis-id', status: 'queued' }),
    });
    apiMocks.forceRefreshReportAnalysis.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          id: 'analysis-id',
          refreshReason: 'up_to_date',
          status: 'completed',
        }),
    });
    apiMocks.retryReportAnalysis.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          id: 'analysis-id',
          retryReason: 'retried',
          status: 'queued',
        }),
    });
    apiMocks.getReportComparison.mockReturnValue({
      data: {
        status: 'unavailable',
      },
      isError: false,
      isLoading: false,
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
    renderReportPage('/report/analysis-id');

    expect(
      screen.getByRole('heading', { name: 'Frontend project health overview' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Repository' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Project stack and sources' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Overall project quality' })).toBeInTheDocument();
  });

  test('shows up-to-date notice after force refresh without navigation', async () => {
    renderReportPage('/report/analysis-id');

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => {
      expect(apiMocks.forceRefreshReportAnalysis).toHaveBeenCalledWith({
        id: 'analysis-id',
      });
    });
    expect(await screen.findByText('Report is up to date')).toBeInTheDocument();
  });

  test('navigates to returned report after force refresh creates new run', async () => {
    apiMocks.forceRefreshReportAnalysis.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          id: 'next-analysis-id',
          refreshReason: 'created',
          status: 'queued',
        }),
    });

    renderReportPageWithLocation('/report/analysis-id');

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/report/next-analysis-id');
    });
  });

  test('renders comparison when previous completed report exists', () => {
    apiMocks.getReportComparison.mockReturnValue({
      data: {
        status: 'available',
        currentReportId: 'analysis-id',
        previousReportId: 'previous-analysis-id',
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
              categories: ['testing'],
              checkIds: ['test-script'],
              impactLevel: 'key',
              effort: 'small',
              title: 'Add an automated test script',
              description: 'Expose a test script.',
              action: 'Add a package.json test script.',
            },
          ],
          persistentCount: 1,
        },
      },
      isError: false,
      isLoading: false,
    });

    renderReportPage('/report/analysis-id');

    expect(
      screen.getByRole('heading', { name: 'Changes since previous report' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('README exists').length).toBeGreaterThan(1);
    expect(screen.getByText('Add an automated test script')).toBeInTheDocument();
  });

  test('requests manual comparison baseline from query string', () => {
    renderReportPage('/report/analysis-id?compareWith=previous-analysis-id');

    expect(apiMocks.getReportComparison).toHaveBeenCalledWith(
      {
        id: 'analysis-id',
        previousId: 'previous-analysis-id',
      },
      {
        skip: false,
      },
    );
  });

  test('renders manual comparison title from query string', () => {
    apiMocks.getReportComparison.mockReturnValue({
      data: {
        status: 'available',
        currentReportId: 'analysis-id',
        previousReportId: 'previous-analysis-id',
        totalScore: {
          current: 82,
          previous: 70,
          delta: 12,
        },
        metrics: [],
        checks: [],
        recommendations: {
          added: [],
          resolved: [],
          persistentCount: 0,
        },
      },
      isError: false,
      isLoading: false,
    });

    renderReportPage('/report/analysis-id?compareWith=previous-analysis-id');

    expect(
      screen.getByRole('heading', { name: 'Comparison with selected run' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Compare the current completed report with the selected previous run from history.',
      ),
    ).toBeInTheDocument();
  });

  test('renders unavailable manual comparison reason from query string', () => {
    apiMocks.getReportComparison.mockReturnValue({
      data: {
        status: 'unavailable',
        reason: 'different_score_categories',
      },
      isError: false,
      isLoading: false,
    });

    renderReportPage('/report/analysis-id?compareWith=previous-analysis-id');

    expect(screen.getByRole('heading', { name: 'Comparison unavailable' })).toBeInTheDocument();
    expect(
      screen.getByText('The selected reports were created with different enabled metric sets.'),
    ).toBeInTheDocument();
  });

  test('renders completed reuse notice from navigation state', () => {
    renderReportPage({
      pathname: '/report/analysis-id',
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

    renderReportPage('/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Loading report' })).toBeInTheDocument();
    expect(screen.getByText(/checking the analysis status/i)).toBeInTheDocument();
  });

  test('renders processing state', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        analysis: processingAnalysis,
        status: 'running',
      },
      isError: false,
      isLoading: false,
    });

    renderReportPage('/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Analysis in progress' })).toBeInTheDocument();
    expect(screen.getByText(/being assembled/i)).toBeInTheDocument();
    expect(screen.getByText('evolutioncpp/frontend-radar')).toBeInTheDocument();
    expect(screen.getByText('apps/web')).toBeInTheDocument();
    expect(screen.getByText('Add frontend report page')).toBeInTheDocument();
    expect(screen.getAllByText('Scanning source code')).not.toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('Repository analysis is in progress');
  });

  test('renders queued processing state with commit sha fallback', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        analysis: {
          ...processingAnalysis,
          projectPath: null,
          latestCommitTitle: null,
          progress: {
            stage: 'queued',
            updatedAt: '2099-06-09T00:00:00.000Z',
          },
          startedAt: null,
        },
        status: 'queued',
      },
      isError: false,
      isLoading: false,
    });

    renderReportPage('/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Analysis is queued' })).toBeInTheDocument();
    expect(screen.getByText('abc123')).toBeInTheDocument();
    expect(screen.getAllByText('Waiting for processing').length).toBeGreaterThan(0);
    expect(screen.queryByText('apps/web')).not.toBeInTheDocument();
  });

  test('renders stale progress hint when current stage has not changed for a while', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-09T00:02:30.000Z'));

    try {
      apiMocks.getReportAnalysis.mockReturnValue({
        data: {
          id: 'analysis-id',
          analysis: {
            ...processingAnalysis,
            progress: {
              stage: 'source_scan',
              updatedAt: '2026-06-09T00:01:00.000Z',
            },
          },
          status: 'running',
        },
        isError: false,
        isLoading: false,
      });

      renderReportPage('/report/analysis-id');

      expect(screen.getByText(/taking longer than usual/i)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  test('renders fallback for unknown report id', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      error: {
        status: 404,
      },
      isError: true,
      isLoading: false,
    });

    renderReportPage('/report/unknown');

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
        status: 418,
      },
      isError: true,
      isLoading: false,
    });

    renderReportPage('/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Report could not be loaded' })).toBeInTheDocument();
    expect(screen.getByText(/could not load this report/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a new analysis' })).toHaveAttribute(
      'href',
      '#repository-analysis',
    );
  });

  test('renders service unavailable state for transport errors', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      error: {
        status: 'FETCH_ERROR',
      },
      isError: true,
      isLoading: false,
    });

    renderReportPage('/report/analysis-id');

    expect(
      screen.getByRole('heading', { name: 'Frontend Radar API is unavailable' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/backend or database is not reachable/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a new analysis' })).toHaveAttribute(
      'href',
      '#repository-analysis',
    );
  });

  test('renders failed analysis state and restarts analysis from the failed report', async () => {
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

    renderReportPage('/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Could not reach GitHub' })).toBeInTheDocument();
    expect(screen.getByText(/GitHub API did not respond/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start a new analysis' }));

    await waitFor(() => {
      expect(apiMocks.retryReportAnalysis).toHaveBeenCalledWith({
        id: 'analysis-id',
      });
    });
  });

  test('renders branch not found failed state', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        status: 'failed',
        errorCode: 'branch_not_found',
        errorMessage: 'Branch was not found.',
      },
      isError: false,
      isLoading: false,
    });

    renderReportPage('/report/analysis-id');

    expect(screen.getByRole('heading', { name: 'Branch was not found' })).toBeInTheDocument();
    expect(screen.getByText(/selected branch is no longer available/i)).toBeInTheDocument();
  });

  test('shows retry error notice when failed report restart fails', async () => {
    apiMocks.retryReportAnalysis.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Retry failed')),
    });
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

    renderReportPage('/report/analysis-id');

    fireEvent.click(screen.getByRole('button', { name: 'Start a new analysis' }));

    expect(await screen.findByText('Could not restart analysis')).toBeInTheDocument();
  });
});
