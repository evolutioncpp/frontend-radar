import type { ProjectReport } from '../modules/reports/domain/reportSchemas.js';

export const DEFAULT_REPORT_COMMIT_DATE = '2026-06-09T00:00:00.000Z';
export const DEFAULT_REPORT_COMMIT_SHA = 'abc123';
export const DEFAULT_REPORT_COMMIT_TITLE = 'Initial frontend quality pass';
export const DEFAULT_REPORT_BRANCH = 'main';

export const emptyReportTooling: ProjectReport['tooling'] = {
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

export const createTestScoreDetails = (
  value: number,
): ProjectReport['scoreBreakdown'][number]['scoreDetails'] => ({
  rawValue: value,
  finalValue: value,
  weight: 1,
  impactLevel: 'supporting',
  checks: [],
});

const getScoreStatus = (score: number): ProjectReport['scoreBreakdown'][number]['status'] => {
  if (score >= 90) {
    return 'excellent';
  }

  if (score >= 70) {
    return 'good';
  }

  if (score >= 50) {
    return 'warning';
  }

  return 'critical';
};

export const createTestProjectReport = ({
  branch = DEFAULT_REPORT_BRANCH,
  id,
  latestCommitDate = DEFAULT_REPORT_COMMIT_DATE,
  latestCommitSha = DEFAULT_REPORT_COMMIT_SHA,
  latestCommitTitle = DEFAULT_REPORT_COMMIT_TITLE,
  owner = 'owner',
  projectPath = null,
  repository = 'repo',
  score = 100,
}: {
  branch?: string;
  id: string;
  latestCommitDate?: string | null;
  latestCommitSha?: string | null;
  latestCommitTitle?: string | null;
  owner?: string;
  projectPath?: string | null;
  repository?: string;
  score?: number;
}): ProjectReport => ({
  analysisSources: [],
  checks: [
    {
      id: 'readme-exists',
      label: 'README exists',
      status: 'passed',
    },
  ],
  createdAt: '2026-06-09T00:00:00.000Z',
  id,
  recommendations: [],
  repository: {
    branch,
    defaultBranch: DEFAULT_REPORT_BRANCH,
    description: 'Test repository',
    forks: 0,
    latestCommitDate,
    latestCommitSha,
    latestCommitTitle,
    license: 'MIT',
    name: repository,
    owner,
    projectDetection: {
      confidence: 'high',
      packageJsonPath: projectPath ? `${projectPath}/package.json` : 'package.json',
      path: projectPath,
      signals: [
        {
          id: 'project-package-json',
          label: 'Frontend package.json',
          source: projectPath ? `${projectPath}/package.json` : 'package.json',
          status: 'found',
        },
      ],
      source: projectPath ? 'manual' : 'autodetect',
    },
    projectPath,
    stars: 1,
    url: `https://github.com/${owner}/${repository}`,
  },
  scoreBreakdown: [
    {
      category: 'documentation',
      description: 'Documentation is present.',
      label: 'Documentation',
      maxValue: 100,
      scoreDetails: createTestScoreDetails(score),
      status: getScoreStatus(score),
      value: score,
    },
  ],
  tooling: emptyReportTooling,
  totalScore: score,
});
