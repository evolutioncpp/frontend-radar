import { firstSource, firstToolingSource } from './reportRecommendationHelpers.js';

import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const addLintScriptRecommendation = {
  id: 'add-lint-script',
  severity: 'medium',
  categories: ['maintainability'],
  checkIds: ['lint-script'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Add a lint script',
  description: 'Expose linting in package.json to make code quality checks repeatable.',
  action: 'Add a package.json lint script that runs the configured linter.',
  isApplicable: (signals) => signals.packageJson.exists && !signals.packageJson.scripts.lint.exists,
  getSource: (signals) => signals.packageJson.path ?? undefined,
} as const satisfies RecommendationDefinition;

export const addTypeScriptRecommendation = {
  id: 'add-typescript',
  severity: 'medium',
  categories: ['maintainability'],
  checkIds: ['typescript'],
  impactLevel: 'important',
  effort: 'medium',
  title: 'Add TypeScript coverage',
  description:
    'Add TypeScript configuration or dependencies so maintainability checks can catch interface and refactor issues earlier.',
  action: 'Add TypeScript config and dependencies for the selected frontend package.',
  isApplicable: (signals) => !signals.typescript.found,
} as const satisfies RecommendationDefinition;

export const enableTypeScriptStrictRecommendation = {
  id: 'enable-typescript-strict',
  severity: 'medium',
  categories: ['maintainability'],
  checkIds: ['typescript-strict'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Enable stricter TypeScript checks',
  description:
    'Enable strict mode or noImplicitAny plus strictNullChecks so refactors catch unsafe contracts earlier.',
  action: 'Enable strict TypeScript checks in the source tsconfig used by the frontend app.',
  isApplicable: (signals) =>
    signals.typescriptQuality.config.exists &&
    signals.typescriptQuality.config.strict === false &&
    !(
      signals.typescriptQuality.config.noImplicitAny &&
      signals.typescriptQuality.config.strictNullChecks
    ),
  getSource: (signals) => signals.typescriptQuality.config.path ?? undefined,
} as const satisfies RecommendationDefinition;

export const addTypecheckScriptRecommendation = {
  id: 'add-typecheck-script',
  severity: 'medium',
  categories: ['maintainability'],
  checkIds: ['typecheck-script'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Add a typecheck script',
  description:
    'Expose a dedicated typecheck script such as tsc --noEmit so CI and contributors can validate types without building.',
  action: 'Add a package.json typecheck script that runs TypeScript without emitting files.',
  isApplicable: (signals) =>
    signals.typescript.found && !signals.typescriptQuality.typecheck.exists,
  getSource: (signals) => signals.packageJson.path ?? undefined,
} as const satisfies RecommendationDefinition;

export const reduceSourceHealthWarningsRecommendation = {
  id: 'reduce-source-health-warnings',
  severity: (signals) => (signals.sourceCode.codeHealth.issueCount >= 12 ? 'medium' : 'low'),
  categories: ['maintainability'],
  checkIds: ['code-health'],
  impactLevel: 'supporting',
  effort: 'medium',
  title: 'Reduce source-level maintainability warnings',
  description:
    'Review debug logs, TODO/FIXME comments, eslint-disable usage and explicit any hotspots in the selected frontend source.',
  action:
    'Review the reported source files and remove debug logs, stale TODOs and unsafe any usage.',
  isApplicable: (signals) => signals.sourceCode.codeHealth.issueCount > 0,
  getSource: (signals) => firstSource(...signals.sourceCode.codeHealth.sources),
} as const satisfies RecommendationDefinition;

export const addStorybookRecommendation = {
  id: 'add-storybook',
  severity: 'low',
  categories: ['maintainability'],
  checkIds: ['storybook'],
  impactLevel: 'supporting',
  effort: 'medium',
  title: 'Add component documentation',
  description: 'Storybook or similar tooling helps review UI states and accessibility details.',
  action: 'Add Storybook or a similar component review tool for key UI states.',
  isApplicable: (signals) => !signals.storybook.found,
  getSource: (signals) => firstToolingSource(signals.storybook.sources),
} as const satisfies RecommendationDefinition;
