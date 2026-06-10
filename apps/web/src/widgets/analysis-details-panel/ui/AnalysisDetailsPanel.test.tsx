import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { AnalysisDetailsPanel } from './AnalysisDetailsPanel';

import type { ProjectReport } from '@/entities/report';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'analysisDetails.empty': 'Not detected',
        'analysisDetails.label': 'Analysis details',
        'analysisDetails.sources.scopes.github': 'GitHub',
        'analysisDetails.sources.scopes.project': 'Project',
        'analysisDetails.sources.scopes.repository': 'Repository',
        'analysisDetails.sources.scopes.root': 'Repository root',
        'analysisDetails.sources.title': 'Analysis sources',
        'analysisDetails.statuses.found': 'Found',
        'analysisDetails.statuses.missing': 'Missing',
        'analysisDetails.statuses.warning': 'Needs review',
        'analysisDetails.title': 'Project stack and sources',
        'analysisDetails.tooling.groups.accessibility': 'Accessibility',
        'analysisDetails.tooling.groups.bundlers': 'Bundler',
        'analysisDetails.tooling.groups.formatting': 'Formatting',
        'analysisDetails.tooling.groups.frameworks': 'Framework',
        'analysisDetails.tooling.groups.linting': 'Linting',
        'analysisDetails.tooling.groups.packageManager': 'Package manager',
        'analysisDetails.tooling.groups.testing': 'Testing',
        'analysisDetails.tooling.groups.typing': 'Typing',
        'analysisDetails.tooling.groups.uiReview': 'UI review',
        'analysisDetails.tooling.title': 'Project stack',
      };

      if (key === 'analysisDetails.sources.counter') {
        return `${options?.count} sources`;
      }

      if (key === 'analysisDetails.sources.source') {
        return `Source: ${options?.source}`;
      }

      return translations[key] ?? key;
    },
  }),
}));

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

const analysisSources: ProjectReport['analysisSources'] = [
  {
    id: 'project-package-json',
    kind: 'package_json',
    label: 'Selected package.json',
    scope: 'project',
    status: 'found',
    source: 'apps/web/package.json',
  },
  {
    id: 'root-package-json',
    kind: 'package_json',
    label: 'Root package.json',
    scope: 'root',
    status: 'warning',
    source: 'package.json',
  },
  {
    id: 'github-repository',
    kind: 'github_api',
    label: 'GitHub repository metadata',
    scope: 'github',
    status: 'found',
    source: 'repos/evolutioncpp/frontend-radar',
  },
];

const tooling: ProjectReport['tooling'] = {
  ...emptyTooling,
  bundlers: [
    {
      id: 'vite',
      label: 'Vite',
      sources: ['apps/web/package.json devDependencies.vite'],
      status: 'found',
    },
  ],
  frameworks: [
    {
      id: 'react',
      label: 'React',
      sources: ['apps/web/package.json dependencies.react'],
      status: 'found',
    },
  ],
  linting: [
    {
      id: 'eslint',
      label: 'ESLint',
      sources: ['package.json devDependencies.eslint'],
      status: 'warning',
    },
  ],
};

describe('AnalysisDetailsPanel', () => {
  test('renders project stack with tooling sources', () => {
    render(<AnalysisDetailsPanel analysisSources={analysisSources} tooling={tooling} />);

    expect(screen.getByRole('heading', { name: 'Project stack and sources' })).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vite')).toBeInTheDocument();
    expect(screen.getByText('ESLint')).toBeInTheDocument();
    expect(screen.getByText('apps/web/package.json dependencies.react')).toBeInTheDocument();
  });

  test('renders grouped analysis sources inside disclosure', () => {
    render(<AnalysisDetailsPanel analysisSources={analysisSources} tooling={tooling} />);

    fireEvent.click(screen.getByText('Analysis sources'));

    expect(screen.getByRole('heading', { name: 'Project' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Repository root' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByText('Selected package.json')).toBeInTheDocument();
    expect(screen.getByText('Root package.json')).toBeInTheDocument();
    expect(screen.getByText('Source: apps/web/package.json')).toBeInTheDocument();
    expect(screen.getAllByText('Needs review').length).toBeGreaterThan(0);
  });
});
