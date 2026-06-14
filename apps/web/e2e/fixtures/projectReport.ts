import type { ProjectReport } from '../../src/entities/report';

const emptyTooling: ProjectReport['tooling'] = {
  packageManager: [],
  frameworks: [],
  bundlers: [],
  testing: [],
  linting: [],
  formatting: [],
  typing: [],
  uiReview: [],
  accessibility: [],
};

const createScoreDetails = (
  finalValue: number,
): ProjectReport['scoreBreakdown'][number]['scoreDetails'] => ({
  rawValue: finalValue,
  finalValue,
  weight: 10,
  impactLevel: 'supporting',
  checks: [
    {
      id: 'readme',
      label: 'README',
      status: 'passed',
      severity: 'critical',
      scope: 'project',
      confidence: 'high',
      earned: 45,
      max: 45,
      source: 'README.md',
    },
  ],
});

export const createE2eProjectReport = (): ProjectReport => ({
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
      signals: [],
    },
    latestCommitSha: 'abc123',
    latestCommitDate: '2026-06-09T00:00:00.000Z',
    latestCommitTitle: 'Add report fixtures',
    license: 'MIT',
  },
  analysisSources: [
    {
      id: 'github-repository-metadata',
      kind: 'github_api',
      scope: 'github',
      status: 'found',
      label: 'GitHub repository metadata',
      description: 'Repository metadata was loaded from GitHub API.',
      source: 'GET /repos/evolutioncpp/frontend-radar',
    },
  ],
  tooling: emptyTooling,
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
  recommendations: [
    {
      id: 'add-ci',
      severity: 'medium',
      categories: ['ci'],
      checkIds: ['github-actions'],
      impactLevel: 'important',
      effort: 'medium',
      title: 'Add CI',
      description: 'Run automated checks for each change.',
      action: 'Create a GitHub Actions workflow for pull requests.',
    },
  ],
});
