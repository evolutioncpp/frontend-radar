import { firstSource } from './reportRecommendationHelpers.js';

import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const addGithubActionsRecommendation = {
  id: 'add-github-actions',
  severity: 'high',
  categories: ['ci'],
  checkIds: ['github-actions'],
  impactLevel: 'key',
  effort: 'medium',
  title: 'Add GitHub Actions checks',
  description: 'Add CI workflows so linting, tests and builds run for every change.',
  action:
    'Create a GitHub Actions workflow that runs install, lint, test and build on pull requests.',
  isApplicable: (signals) => !signals.ci.exists,
  getSource: () => '.github/workflows',
} as const satisfies RecommendationDefinition;

export const addCiTestStepRecommendation = {
  id: 'add-ci-test-step',
  severity: 'high',
  categories: ['ci'],
  checkIds: ['ci-test-step'],
  impactLevel: 'key',
  effort: 'small',
  title: 'Run tests in CI',
  description: 'Add a test step so regressions are caught automatically before delivery.',
  action: 'Add a test command to the existing workflow after dependency installation.',
  isApplicable: (signals) => signals.ci.exists && !signals.ciAnalysis.test.found,
  getSource: (signals) =>
    firstSource(...signals.ciAnalysis.analyzedWorkflowPaths, signals.ci.source),
} as const satisfies RecommendationDefinition;

export const addCiBuildStepRecommendation = {
  id: 'add-ci-build-step',
  severity: 'high',
  categories: ['ci'],
  checkIds: ['ci-build-step'],
  impactLevel: 'key',
  effort: 'small',
  title: 'Run production build in CI',
  description: 'Add a build step so the selected frontend project is compiled in CI.',
  action: 'Add a production build step to the workflow for the selected frontend package.',
  isApplicable: (signals) => signals.ci.exists && !signals.ciAnalysis.build.found,
  getSource: (signals) =>
    firstSource(...signals.ciAnalysis.analyzedWorkflowPaths, signals.ci.source),
} as const satisfies RecommendationDefinition;

export const addCiPrChecksRecommendation = {
  id: 'add-ci-pr-checks',
  severity: 'medium',
  categories: ['ci'],
  checkIds: ['ci-pr-trigger'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Run CI on pull requests',
  description: 'Add a pull_request trigger so frontend checks run before code is merged.',
  action: 'Add a pull_request trigger to the existing GitHub Actions workflow.',
  isApplicable: (signals) => signals.ci.exists && !signals.ciAnalysis.pullRequest.found,
  getSource: (signals) =>
    firstSource(...signals.ciAnalysis.analyzedWorkflowPaths, signals.ci.source),
} as const satisfies RecommendationDefinition;

export const addCiInstallStepRecommendation = {
  id: 'add-ci-install-step',
  severity: 'medium',
  categories: ['ci'],
  checkIds: ['ci-install-step'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Install dependencies in CI',
  description:
    'Add an install step such as npm ci, pnpm install or yarn install before checks run.',
  action: 'Add a package-manager install step before lint, test and build jobs.',
  isApplicable: (signals) => signals.ci.exists && !signals.ciAnalysis.install.found,
  getSource: (signals) =>
    firstSource(...signals.ciAnalysis.analyzedWorkflowPaths, signals.ci.source),
} as const satisfies RecommendationDefinition;

export const addCiLintStepRecommendation = {
  id: 'add-ci-lint-step',
  severity: 'medium',
  categories: ['ci'],
  checkIds: ['ci-lint-step'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Run linting in CI',
  description: 'Add a lint step to the GitHub Actions workflow for repeatable code checks.',
  action: 'Add the frontend lint command to the existing workflow.',
  isApplicable: (signals) => signals.ci.exists && !signals.ciAnalysis.lint.found,
  getSource: (signals) =>
    firstSource(...signals.ciAnalysis.analyzedWorkflowPaths, signals.ci.source),
} as const satisfies RecommendationDefinition;

export const scopeCiToFrontendPathRecommendation = {
  id: 'scope-ci-to-frontend-path',
  severity: 'medium',
  categories: ['ci'],
  checkIds: ['ci-project-scope'],
  impactLevel: 'important',
  effort: 'medium',
  title: 'Scope CI to the selected frontend path',
  description:
    'Use working-directory, workspace or filter options so CI checks target the analyzed frontend package.',
  action: 'Set working-directory, workspace or filter options for the selected frontend path.',
  isApplicable: (signals) =>
    Boolean(signals.projectPath) && signals.ci.exists && !signals.ciAnalysis.projectScope.found,
  getSource: (signals) => signals.projectPath,
} as const satisfies RecommendationDefinition;
