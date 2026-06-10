import type { ProjectReport } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignals.js';

type ReportRecommendation = ProjectReport['recommendations'][number];

const recommendationSeverityOrder = {
  high: 0,
  medium: 1,
  low: 2,
} as const satisfies Record<ReportRecommendation['severity'], number>;

const isReadmeIncomplete = (signals: RepositorySignals) => {
  return (
    !signals.readme.isSubstantial ||
    !signals.readme.hasInstallSection ||
    !signals.readme.hasUsageSection
  );
};

const sortRecommendationsByPriority = (recommendations: ProjectReport['recommendations']) => {
  return recommendations
    .map((recommendation, index) => ({
      index,
      recommendation,
    }))
    .sort((left, right) => {
      const severityDiff =
        recommendationSeverityOrder[left.recommendation.severity] -
        recommendationSeverityOrder[right.recommendation.severity];

      return severityDiff || left.index - right.index;
    })
    .map(({ recommendation }) => recommendation);
};

export const buildRecommendations = (signals: RepositorySignals) => {
  const recommendations: ProjectReport['recommendations'] = [];

  if (!signals.packageJson.exists) {
    recommendations.push({
      id: 'add-package-metadata',
      severity: 'high',
      title: 'Add package metadata',
      description:
        'Add package.json so scripts, dependencies and project tooling can be installed and checked consistently.',
    });
  }

  if (!signals.ci.exists) {
    recommendations.push({
      id: 'add-github-actions',
      severity: 'high',
      title: 'Add GitHub Actions checks',
      description: 'Add CI workflows so linting, tests and builds run for every change.',
    });
  }

  if (signals.packageJson.exists && !signals.packageJson.scripts.test.exists) {
    recommendations.push({
      id: 'add-test-script',
      severity: 'high',
      title: 'Add an automated test script',
      description: 'Expose a test script in package.json so quality checks are easy to run.',
    });
  }

  if (signals.packageJson.exists && !signals.packageJson.scripts.build.exists) {
    recommendations.push({
      id: 'add-build-script',
      severity: 'high',
      title: 'Add a production build script',
      description:
        'Expose a build script in package.json so CI can verify that the frontend compiles before delivery.',
    });
  }

  if (!signals.readme.exists) {
    recommendations.push({
      id: 'add-readme',
      severity: 'medium',
      title: 'Add a project README',
      description:
        'Add setup, usage and contribution notes so contributors can understand and run the project quickly.',
    });
  } else if (isReadmeIncomplete(signals)) {
    recommendations.push({
      id: 'improve-readme',
      severity: 'medium',
      title: 'Expand README setup and usage details',
      description:
        'Add installation/setup and usage/examples sections so the README explains how to run and validate the project.',
    });
  }

  if (signals.packageJson.exists && !signals.packageJson.scripts.lint.exists) {
    recommendations.push({
      id: 'add-lint-script',
      severity: 'medium',
      title: 'Add a lint script',
      description: 'Expose linting in package.json to make code quality checks repeatable.',
    });
  }

  if (!signals.typescript.found) {
    recommendations.push({
      id: 'add-typescript',
      severity: 'medium',
      title: 'Add TypeScript coverage',
      description:
        'Add TypeScript configuration or dependencies so maintainability checks can catch interface and refactor issues earlier.',
    });
  }

  if (signals.packageJson.exists && !signals.testingLibrary.found) {
    recommendations.push({
      id: 'add-testing-library',
      severity: 'medium',
      title: 'Add frontend testing tooling',
      description:
        'Add Vitest, Jest, Playwright or Testing Library so the test script has a clear frontend testing stack behind it.',
    });
  }

  if (!signals.a11yTooling.found) {
    recommendations.push({
      id: 'add-a11y-tooling',
      severity: 'medium',
      title: 'Add accessibility checks',
      description:
        'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
    });
  }

  if (signals.packageJson.exists && !signals.bundler.found) {
    recommendations.push({
      id: 'add-bundler',
      severity: 'medium',
      title: 'Declare frontend build tooling',
      description:
        'Add or expose a frontend bundler such as Vite, Next.js, Webpack or Parcel so build readiness is easier to verify.',
    });
  }

  if (signals.packageJson.exists && !signals.lockfile.exists) {
    recommendations.push({
      id: 'commit-lockfile',
      severity: 'medium',
      title: 'Commit a package lockfile',
      description: 'A lockfile keeps dependency installs reproducible across machines and CI.',
    });
  }

  if (!signals.storybook.found) {
    recommendations.push({
      id: 'add-storybook',
      severity: 'low',
      title: 'Add component documentation',
      description: 'Storybook or similar tooling helps review UI states and accessibility details.',
    });
  }

  if (!signals.envExample.exists) {
    recommendations.push({
      id: 'add-env-example',
      severity: 'low',
      title: 'Document environment variables',
      description: 'Add an .env.example file so setup requirements are clear for contributors.',
    });
  }

  return sortRecommendationsByPriority(recommendations);
};
