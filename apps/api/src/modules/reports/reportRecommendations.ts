import type { ProjectReport } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignals.js';

export const buildRecommendations = (signals: RepositorySignals) => {
  const recommendations: ProjectReport['recommendations'] = [];

  if (!signals.hasCi) {
    recommendations.push({
      id: 'add-github-actions',
      severity: 'high',
      title: 'Add GitHub Actions checks',
      description: 'Add CI workflows so linting, tests and builds run for every change.',
    });
  }

  if (!signals.hasTestScript) {
    recommendations.push({
      id: 'add-test-script',
      severity: 'high',
      title: 'Add an automated test script',
      description: 'Expose a test script in package.json so quality checks are easy to run.',
    });
  }

  if (!signals.hasLintScript) {
    recommendations.push({
      id: 'add-lint-script',
      severity: 'medium',
      title: 'Add a lint script',
      description: 'Expose linting in package.json to make code quality checks repeatable.',
    });
  }

  if (!signals.hasStorybook) {
    recommendations.push({
      id: 'add-storybook',
      severity: 'medium',
      title: 'Add component documentation',
      description: 'Storybook or similar tooling helps review UI states and accessibility details.',
    });
  }

  if (!signals.hasEnvExample) {
    recommendations.push({
      id: 'add-env-example',
      severity: 'low',
      title: 'Document environment variables',
      description: 'Add an .env.example file so setup requirements are clear for contributors.',
    });
  }

  if (!signals.hasLockfile) {
    recommendations.push({
      id: 'commit-lockfile',
      severity: 'low',
      title: 'Commit a package lockfile',
      description: 'A lockfile keeps dependency installs reproducible across machines and CI.',
    });
  }

  return recommendations;
};
