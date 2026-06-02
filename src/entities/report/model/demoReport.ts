import type { ProjectReport } from './types';

export const demoReport: ProjectReport = {
  id: 'demo-report',
  createdAt: '2026-06-02T00:00:00.000Z',
  totalScore: 82,
  repository: {
    owner: 'evolutioncpp',
    name: 'frontend-radar',
    url: 'https://github.com/evolutioncpp/frontend-radar',
    description:
      'A frontend project health dashboard for analyzing repository quality, tooling, tests and documentation.',
    stars: 128,
    forks: 14,
    defaultBranch: 'main',
    latestCommitDate: '2026-06-02T00:00:00.000Z',
    license: 'MIT',
  },
  scoreBreakdown: [
    {
      category: 'documentation',
      label: 'Documentation',
      value: 88,
      maxValue: 100,
      status: 'good',
      description: 'README and setup documentation are mostly complete.',
    },
    {
      category: 'testing',
      label: 'Testing',
      value: 76,
      maxValue: 100,
      status: 'good',
      description: 'Unit and e2e testing foundation exists, but coverage can be improved.',
    },
    {
      category: 'ci',
      label: 'CI/CD',
      value: 92,
      maxValue: 100,
      status: 'excellent',
      description: 'Automated checks are configured for build and quality gates.',
    },
    {
      category: 'dependencies',
      label: 'Dependencies',
      value: 71,
      maxValue: 100,
      status: 'warning',
      description: 'Core dependencies are modern, but update policy is not defined yet.',
    },
    {
      category: 'maintainability',
      label: 'Maintainability',
      value: 84,
      maxValue: 100,
      status: 'good',
      description: 'Project structure is predictable and follows layered architecture.',
    },
    {
      category: 'performance',
      label: 'Performance',
      value: 79,
      maxValue: 100,
      status: 'good',
      description: 'Build setup is optimized, but runtime metrics are not tracked yet.',
    },
    {
      category: 'accessibility',
      label: 'Accessibility',
      value: 65,
      maxValue: 100,
      status: 'warning',
      description: 'Basic accessibility linting exists, but manual checks are still needed.',
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      label: 'README exists',
      status: 'passed',
    },
    {
      id: 'package-json-exists',
      label: 'package.json exists',
      status: 'passed',
    },
    {
      id: 'typescript-detected',
      label: 'TypeScript detected',
      status: 'passed',
    },
    {
      id: 'lint-script-exists',
      label: 'Lint script exists',
      status: 'passed',
    },
    {
      id: 'test-script-exists',
      label: 'Test script exists',
      status: 'passed',
    },
    {
      id: 'storybook-missing',
      label: 'Storybook is not configured',
      status: 'warning',
      description: 'Storybook can help document and test UI components in isolation.',
    },
    {
      id: 'env-example-missing',
      label: '.env.example is missing',
      status: 'failed',
      description: 'Document required environment variables for local setup.',
    },
  ],
  recommendations: [
    {
      id: 'add-github-actions',
      severity: 'high',
      title: 'Add GitHub Actions pipeline',
      description:
        'Run lint, build, unit tests and e2e tests on every pull request to prevent regressions.',
    },
    {
      id: 'add-storybook',
      severity: 'medium',
      title: 'Document UI components with Storybook',
      description: 'Add stories for shared UI components and important dashboard states.',
    },
    {
      id: 'add-env-example',
      severity: 'low',
      title: 'Add .env.example',
      description:
        'Document required environment variables so contributors can run the project locally.',
    },
  ],
};
