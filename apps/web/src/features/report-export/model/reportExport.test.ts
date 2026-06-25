import { describe, expect, test } from 'vitest';

import { createReportMarkdownExport, type ReportExportTranslator } from './reportExport';

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

const translations: Record<string, string> = {
  'analysisDetails.sources.scopes.github': 'GitHub',
  'analysisDetails.sources.scopes.project': 'Project',
  'analysisDetails.sources.scopes.repository': 'Repository',
  'analysisDetails.sources.scopes.root': 'Repository root',
  'analysisDetails.statuses.found': 'Found',
  'analysisDetails.statuses.missing': 'Missing',
  'analysisDetails.statuses.warning': 'Warning',
  'analysisDetails.tooling.groups.accessibility': 'Accessibility',
  'analysisDetails.tooling.groups.bundlers': 'Bundler',
  'analysisDetails.tooling.groups.formatting': 'Formatting',
  'analysisDetails.tooling.groups.frameworks': 'Framework',
  'analysisDetails.tooling.groups.linting': 'Linting',
  'analysisDetails.tooling.groups.packageManager': 'Package manager',
  'analysisDetails.tooling.groups.testing': 'Testing',
  'analysisDetails.tooling.groups.typing': 'Typing',
  'analysisDetails.tooling.groups.uiReview': 'UI review',
  'recommendations.categories.testing': 'Testing',
  'recommendations.effort.small': 'Small effort',
  'recommendations.empty': 'No recommendations for now.',
  'recommendations.impact.key': 'Key impact',
  'reportExport.emptyAnalysisSources': 'No analysis sources.',
  'reportExport.emptyChecks': 'No checks.',
  'reportExport.emptyTooling': 'No tooling detected.',
  'reportExport.fields.action': 'Action',
  'reportExport.fields.categories': 'Categories',
  'reportExport.fields.commit': 'Commit',
  'reportExport.fields.commitDate': 'Commit date',
  'reportExport.fields.commitTitle': 'Commit title',
  'reportExport.fields.description': 'Description',
  'reportExport.fields.effort': 'Effort',
  'reportExport.fields.impact': 'Impact',
  'reportExport.fields.repository': 'Repository',
  'reportExport.fields.repositoryUrl': 'Repository URL',
  'reportExport.fields.reportDate': 'Report date',
  'reportExport.fields.score': 'Score',
  'reportExport.fields.severity': 'Severity',
  'reportExport.fields.source': 'Source',
  'reportExport.fields.status': 'Status',
  'reportExport.fields.totalScore': 'Total score',
  'reportExport.sections.analysisSources': 'Analysis sources',
  'reportExport.sections.checks': 'Checks',
  'reportExport.sections.metadata': 'Metadata',
  'reportExport.sections.metrics': 'Metrics',
  'reportExport.sections.recommendations': 'Recommendations',
  'reportExport.sections.summary': 'Summary',
  'reportExport.sections.tooling': 'Project stack',
  'repository.metadata.branch': 'Branch',
  'repository.metadata.license': 'License',
  'repository.metadata.projectPath': 'Frontend path',
  'repository.metadata.unknown': 'Unknown',
  'statuses.failed': 'Failed',
  'statuses.good': 'Good',
  'statuses.high': 'High',
  'statuses.passed': 'Passed',
};

const t: ReportExportTranslator = (key, options) => {
  if (key === 'reportExport.title') {
    return `Frontend Radar report: ${options?.repository}`;
  }

  return translations[key] ?? key;
};

const createReport = (): ProjectReport => ({
  analysisSources: [
    {
      id: 'github-repository',
      kind: 'github_api',
      label: 'GitHub repository metadata',
      scope: 'github',
      source: 'GET /repos/acme/frontend-radar',
      status: 'found',
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      description: 'README contains [setup] _steps_.',
      label: 'README [docs]',
      status: 'passed',
    },
  ],
  createdAt: '2026-06-09T00:00:00.000Z',
  id: 'analysis-id',
  recommendations: [
    {
      action: 'Add `npm test` to package.json.',
      categories: ['testing'],
      checkIds: ['test-script'],
      description: 'Automated checks are missing.',
      effort: 'small',
      id: 'add-tests',
      impactLevel: 'key',
      severity: 'high',
      source: 'package.json scripts',
      title: 'Add test script',
    },
  ],
  repository: {
    branch: 'main',
    defaultBranch: 'main',
    description: null,
    forks: 2,
    latestCommitDate: '2026-06-08T12:30:00.000Z',
    latestCommitSha: 'abcdef1234567890',
    latestCommitTitle: 'Ship report export',
    license: null,
    name: 'Frontend Radar',
    owner: 'Acme Team',
    projectDetection: {
      confidence: 'high',
      packageJsonPath: 'package.json',
      path: null,
      signals: [],
      source: 'manual',
    },
    projectPath: null,
    stars: 10,
    url: 'https://github.com/acme/frontend-radar',
  },
  scoreBreakdown: [
    {
      category: 'testing',
      description: 'Testing signals.',
      label: 'Testing',
      maxValue: 100,
      scoreDetails: {
        checks: [],
        finalValue: 82,
        impactLevel: 'key',
        rawValue: 82,
        weight: 10,
      },
      status: 'good',
      value: 82,
    },
  ],
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
            raw: 'package.json dependencies.react',
          },
        ],
        status: 'found',
      },
    ],
  },
  totalScore: 82,
});

describe('createReportMarkdownExport', () => {
  test('builds markdown content and safe filename for a completed report', () => {
    const reportExport = createReportMarkdownExport(createReport(), {
      locale: 'en',
      t,
    });

    expect(reportExport.filename).toBe(
      'frontend-radar-acme-team-frontend-radar-abcdef1-2026-06-09.md',
    );
    expect(reportExport.content).toContain('# Frontend Radar report: Acme Team/Frontend Radar');
    expect(reportExport.content).toContain('## Metadata');
    expect(reportExport.content).toContain(
      '- Repository URL: https://github.com/acme/frontend-radar',
    );
    expect(reportExport.content).toContain('- License: Unknown');
    expect(reportExport.content).not.toContain('Frontend path');
    expect(reportExport.content).toContain('## Metrics');
    expect(reportExport.content).toContain('### Testing');
    expect(reportExport.content).toContain('- Score: 82/100');
    expect(reportExport.content).toContain('- Passed: README \\[docs\\]');
    expect(reportExport.content).toContain('README contains \\[setup\\] \\_steps\\_.');
    expect(reportExport.content).toContain('### Add test script');
    expect(reportExport.content).toContain('- Severity: High');
    expect(reportExport.content).toContain('- Action: Add \\`npm test\\` to package.json.');
    expect(reportExport.content).toContain(
      '- Found: GitHub repository metadata (GitHub) - GET /repos/acme/frontend-radar',
    );
    expect(reportExport.content).toContain(
      '- Framework: React - Found (package.json / dependencies)',
    );
    expect(reportExport.content).not.toContain('null');
    expect(reportExport.content).not.toContain('undefined');
  });
});
