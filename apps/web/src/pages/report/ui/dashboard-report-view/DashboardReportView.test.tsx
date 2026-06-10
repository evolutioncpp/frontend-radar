import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { DashboardReportView } from './DashboardReportView';

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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'page.reportAria': 'Dashboard report',
        'page.sections.repository': 'Repository summary',
        'page.sections.analysisDetails': 'Analysis details',
        'page.sections.healthScore': 'Health score',
        'page.sections.comparison': 'Report comparison',
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
      };

      if (key === 'page.copySectionLink') {
        return `Copy link to ${options?.section} section`;
      }

      if (key === 'evidence.source') {
        return `Source: ${options?.source}`;
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

const customReport: ProjectReport = {
  analysisSources: [
    {
      id: 'project-package-json',
      kind: 'package_json',
      label: 'Selected package.json',
      scope: 'project',
      status: 'found',
      source: 'package.json',
    },
  ],
  id: 'custom-report',
  createdAt: '2026-06-06T00:00:00.000Z',
  totalScore: 47,
  repository: {
    owner: 'acme',
    name: 'custom-dashboard',
    url: 'https://github.com/acme/custom-dashboard',
    description: 'Custom repository description',
    stars: 42,
    forks: 7,
    defaultBranch: 'develop',
    projectPath: null,
    projectDetection: {
      source: 'autodetect',
      path: null,
      packageJsonPath: 'package.json',
      confidence: 'medium',
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
    latestCommitDate: '2026-06-06T00:00:00.000Z',
    latestCommitTitle: 'Add custom dashboard report',
    license: 'Apache-2.0',
  },
  scoreBreakdown: [
    {
      category: 'testing',
      label: 'Custom testing score',
      value: 47,
      maxValue: 100,
      status: 'warning',
      description: 'Custom testing description',
      evidence: [
        {
          id: 'test-script',
          label: 'Custom evidence label',
          status: 'found',
          source: 'package.json scripts.test',
        },
      ],
    },
  ],
  checks: [
    {
      id: 'custom-check',
      label: 'Custom check label',
      status: 'failed',
      description: 'Custom check description',
    },
  ],
  recommendations: [
    {
      id: 'custom-recommendation',
      severity: 'high',
      title: 'Custom recommendation title',
      description: 'Custom recommendation description',
    },
  ],
  tooling: {
    ...emptyTooling,
    bundlers: [
      {
        id: 'vite',
        label: 'Vite',
        sources: ['package.json devDependencies.vite'],
        status: 'found',
      },
    ],
  },
};

const renderDashboardReportView = (report: ProjectReport) => {
  return render(
    <MemoryRouter initialEntries={['/dashboard/report/demo']}>
      <DashboardReportView report={report} />
    </MemoryRouter>,
  );
};

describe('DashboardReportView', () => {
  test('renders report data from props', () => {
    renderDashboardReportView(customReport);

    expect(screen.getByRole('heading', { name: 'acme/custom-dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Custom repository description')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Project stack and sources' })).toBeInTheDocument();
    expect(screen.getByText('Vite')).toBeInTheDocument();
    expect(screen.getByText('Custom testing score')).toBeInTheDocument();
    expect(screen.getByText('Custom check label')).toBeInTheDocument();
    expect(screen.getByText('Custom recommendation title')).toBeInTheDocument();
    expect(screen.queryByText(/evolutioncpp\/frontend-radar/i)).not.toBeInTheDocument();
  });
});
