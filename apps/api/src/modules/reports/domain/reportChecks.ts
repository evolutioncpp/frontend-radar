import {
  defaultEnabledScoreCategories,
  normalizeEnabledScoreCategories,
} from './reportScoreCategories.js';

import type { ScoreCategory } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignalContracts.js';

const checkCategories = {
  'readme-exists': ['documentation'],
  'package-json-exists': [
    'dependencies',
    'testing',
    'maintainability',
    'performance',
    'accessibility',
  ],
  'typescript-detected': ['maintainability'],
  'lint-script-exists': ['maintainability'],
  'test-script-exists': ['testing'],
  'build-script-exists': ['performance'],
  'github-actions-exists': ['ci'],
  'env-example-exists': ['documentation', 'security'],
} as const satisfies Record<string, readonly ScoreCategory[]>;

type ReportCheckId = keyof typeof checkCategories;

const createCheck = (
  id: ReportCheckId,
  label: string,
  passed: boolean,
  failedDescription: string,
) => ({
  id,
  label,
  status: passed ? ('passed' as const) : ('failed' as const),
  ...(passed
    ? {}
    : {
        description: failedDescription,
      }),
});

type ReportCheck = ReturnType<typeof createCheck>;

const isCheckEnabled = (check: ReportCheck, enabledCategories: readonly ScoreCategory[]) => {
  const categories = checkCategories[check.id];

  return categories.some((category) => enabledCategories.includes(category));
};

export const buildChecks = (
  signals: RepositorySignals,
  enabledScoreCategories: readonly ScoreCategory[] = defaultEnabledScoreCategories,
) => {
  const enabledCategories = normalizeEnabledScoreCategories(enabledScoreCategories);

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
  ].filter((check) => isCheckEnabled(check, enabledCategories));
};
