import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const addTestScriptRecommendation = {
  id: 'add-test-script',
  severity: 'high',
  categories: ['testing'],
  checkIds: ['test-script'],
  impactLevel: 'key',
  effort: 'small',
  title: 'Add an automated test script',
  description: 'Expose a test script in package.json so quality checks are easy to run.',
  action: 'Add a package.json test script that runs the selected frontend test runner.',
  isApplicable: (signals) => signals.packageJson.exists && !signals.packageJson.scripts.test.exists,
  getSource: (signals) => signals.packageJson.path ?? undefined,
} as const satisfies RecommendationDefinition;

export const addTestFilesRecommendation = {
  id: 'add-test-files',
  severity: 'high',
  categories: ['testing'],
  checkIds: ['test-files'],
  impactLevel: 'key',
  effort: 'medium',
  title: 'Add representative test files',
  description:
    'Add test or spec files for the selected frontend package so the test script validates real behavior.',
  action: 'Add unit or component test files for the most important frontend paths.',
  isApplicable: (signals) => signals.packageJson.exists && signals.testQuality.files.count === 0,
} as const satisfies RecommendationDefinition;

export const addCoverageSignalRecommendation = {
  id: 'add-coverage-signal',
  severity: 'medium',
  categories: ['testing'],
  checkIds: ['test-coverage'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Add a coverage check',
  description:
    'Expose a coverage script or coverage configuration so test quality is easier to track over time.',
  action: 'Add a coverage script or enable coverage in the frontend test runner config.',
  isApplicable: (signals) => signals.packageJson.exists && !signals.testQuality.coverage.found,
  getSource: (signals) => signals.packageJson.path ?? undefined,
} as const satisfies RecommendationDefinition;

export const addTestingLibraryRecommendation = {
  id: 'add-testing-library',
  severity: 'medium',
  categories: ['testing'],
  checkIds: ['testing-library'],
  impactLevel: 'important',
  effort: 'medium',
  title: 'Add frontend testing tooling',
  description:
    'Add Vitest, Jest, Playwright or Testing Library so the test script has a clear frontend testing stack behind it.',
  action: 'Install or expose frontend testing tooling for unit, component or e2e checks.',
  isApplicable: (signals) => signals.packageJson.exists && !signals.testingLibrary.found,
  getSource: (signals) => signals.packageJson.path ?? undefined,
} as const satisfies RecommendationDefinition;
