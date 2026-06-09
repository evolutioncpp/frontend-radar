import type { RepositorySignals } from './reportSignals.js';

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
    createCheck('readme-exists', 'README exists', signals.hasReadme, 'README file was not found.'),
    createCheck(
      'package-json-exists',
      'package.json exists',
      signals.hasPackageJson,
      'package.json was not found.',
    ),
    createCheck(
      'typescript-detected',
      'TypeScript detected',
      signals.hasTypescript,
      'TypeScript configuration or dependency was not found.',
    ),
    createCheck(
      'lint-script-exists',
      'Lint script exists',
      signals.hasLintScript,
      'package.json does not expose a lint script.',
    ),
    createCheck(
      'test-script-exists',
      'Test script exists',
      signals.hasTestScript,
      'package.json does not expose a test script.',
    ),
    createCheck(
      'build-script-exists',
      'Build script exists',
      signals.hasBuildScript,
      'package.json does not expose a build script.',
    ),
    createCheck(
      'github-actions-exists',
      'GitHub Actions workflow exists',
      signals.hasCi,
      'No GitHub Actions workflow was found.',
    ),
    createCheck(
      'env-example-exists',
      'Environment example exists',
      signals.hasEnvExample,
      'No environment example file was found.',
    ),
  ];
};
