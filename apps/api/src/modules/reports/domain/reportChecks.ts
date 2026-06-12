import type { RepositorySignals } from '../analysis/signals/reportSignals.js';

const createCheck = (id: string, label: string, passed: boolean, failedDescription: string) => ({
  id,
  label,
  status: passed ? ('passed' as const) : ('failed' as const),
  ...(passed
    ? {}
    : {
        description: failedDescription,
      }),
});

export const buildChecks = (signals: RepositorySignals) => {
  return [
    createCheck(
      'readme-exists',
      'README exists',
      signals.readme.exists,
      'README file was not found.',
    ),
    createCheck(
      'package-json-exists',
      'package.json exists',
      signals.packageJson.exists,
      'package.json was not found.',
    ),
    createCheck(
      'typescript-detected',
      'TypeScript detected',
      signals.typescript.found,
      'TypeScript configuration or dependency was not found.',
    ),
    createCheck(
      'lint-script-exists',
      'Lint script exists',
      signals.packageJson.scripts.lint.exists,
      'package.json does not expose a lint script.',
    ),
    createCheck(
      'test-script-exists',
      'Test script exists',
      signals.packageJson.scripts.test.exists,
      'package.json does not expose a test script.',
    ),
    createCheck(
      'build-script-exists',
      'Build script exists',
      signals.packageJson.scripts.build.exists,
      'package.json does not expose a build script.',
    ),
    createCheck(
      'github-actions-exists',
      'GitHub Actions workflow exists',
      signals.ci.exists,
      'No GitHub Actions workflow was found.',
    ),
    createCheck(
      'env-example-exists',
      'Environment example exists',
      signals.envExample.exists,
      'No environment example file was found.',
    ),
  ];
};
