import {
  defaultEnabledScoreCategories,
  normalizeEnabledScoreCategories,
} from './reportScoreCategories.js';

import type { ProjectReport } from './reportSchemas.js';
import type { ScoreCategory } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignalContracts.js';
import type { ReportScoreCheckId } from '../scoring/reportScoreCheckIds.js';

type ReportRecommendation = ProjectReport['recommendations'][number];
type RecommendationSeverity = ReportRecommendation['severity'];
type RecommendationImpactLevel = ReportRecommendation['impactLevel'];
type RecommendationEffort = ReportRecommendation['effort'];

type RecommendationContext = {
  enabledCategorySet: ReadonlySet<ScoreCategory>;
};

type RecommendationDefinition = {
  id: string;
  severity:
    | RecommendationSeverity
    | ((signals: RepositorySignals, context: RecommendationContext) => RecommendationSeverity);
  categories: readonly ScoreCategory[];
  checkIds: readonly ReportScoreCheckId[];
  impactLevel: RecommendationImpactLevel;
  effort: RecommendationEffort;
  title: string;
  description: string;
  action: string;
  isApplicable: (signals: RepositorySignals, context: RecommendationContext) => boolean;
  getSource?: (signals: RepositorySignals) => string | undefined;
};

const recommendationSeverityOrder = {
  high: 0,
  medium: 1,
  low: 2,
} as const satisfies Record<RecommendationSeverity, number>;

const recommendationImpactOrder = {
  key: 0,
  important: 1,
  supporting: 2,
} as const satisfies Record<RecommendationImpactLevel, number>;

const recommendationEffortOrder = {
  small: 0,
  medium: 1,
  large: 2,
} as const satisfies Record<RecommendationEffort, number>;

const firstSource = (...sources: Array<string | null | undefined>) => {
  return sources.find(
    (source): source is string => typeof source === 'string' && source.length > 0,
  );
};

const firstToolingSource = (sources: RepositorySignals['typescript']['sources']) => {
  return sources[0]?.raw;
};

const isReadmeIncomplete = (signals: RepositorySignals) => {
  return (
    !signals.readme.isSubstantial ||
    !signals.readme.hasInstallSection ||
    !signals.readme.hasUsageSection
  );
};

const recommendationDefinitions = [
  {
    id: 'add-package-metadata',
    severity: 'high',
    categories: ['dependencies'],
    checkIds: ['package-json'],
    impactLevel: 'key',
    effort: 'medium',
    title: 'Add package metadata',
    description:
      'Add package.json so scripts, dependencies and project tooling can be installed and checked consistently.',
    action:
      'Create package.json for the analyzed frontend package and commit the scripts it needs.',
    isApplicable: (signals) => !signals.packageJson.exists,
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'add-test-script',
    severity: 'high',
    categories: ['testing'],
    checkIds: ['test-script'],
    impactLevel: 'key',
    effort: 'small',
    title: 'Add an automated test script',
    description: 'Expose a test script in package.json so quality checks are easy to run.',
    action: 'Add a package.json test script that runs the selected frontend test runner.',
    isApplicable: (signals) =>
      signals.packageJson.exists && !signals.packageJson.scripts.test.exists,
    getSource: (signals) => signals.packageJson.path ?? undefined,
  },
  {
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
  },
  {
    id: 'add-build-script',
    severity: 'high',
    categories: ['performance'],
    checkIds: ['build-script'],
    impactLevel: 'key',
    effort: 'small',
    title: 'Add a production build script',
    description:
      'Expose a build script in package.json so CI can verify that the frontend compiles before delivery.',
    action: 'Add a package.json build script that creates a production frontend bundle.',
    isApplicable: (signals) =>
      signals.packageJson.exists && !signals.packageJson.scripts.build.exists,
    getSource: (signals) => signals.packageJson.path ?? undefined,
  },
  {
    id: 'remove-sensitive-files',
    severity: 'high',
    categories: ['security'],
    checkIds: ['security-sensitive-files'],
    impactLevel: 'key',
    effort: 'medium',
    title: 'Remove sensitive files from the repository',
    description:
      'Remove committed env, npmrc or private key files and rotate any exposed credentials before using the repository again.',
    action:
      'Delete committed sensitive files, rotate exposed credentials and keep only safe examples.',
    isApplicable: (signals) => signals.security.sensitiveFiles.found,
    getSource: (signals) => firstSource(...signals.security.sensitiveFiles.sources),
  },
  {
    id: 'replace-hardcoded-secret',
    severity: 'high',
    categories: ['security'],
    checkIds: ['security-secret-patterns'],
    impactLevel: 'key',
    effort: 'medium',
    title: 'Move hardcoded secrets out of source code',
    description:
      'Replace hardcoded secret-looking values with environment variables or a secret manager. The report intentionally does not expose the values.',
    action:
      'Move secret-looking values to environment variables or a secret manager and rotate them.',
    isApplicable: (signals) => signals.security.hardcodedSecrets.found,
    getSource: (signals) => firstSource(...signals.security.hardcodedSecrets.sources),
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'add-readme',
    severity: 'medium',
    categories: ['documentation'],
    checkIds: ['readme'],
    impactLevel: 'important',
    effort: 'small',
    title: 'Add a project README',
    description:
      'Add setup, usage and contribution notes so contributors can understand and run the project quickly.',
    action:
      'Create a README with setup, usage and validation instructions for the frontend project.',
    isApplicable: (signals) => !signals.readme.exists,
    getSource: () => 'README.md',
  },
  {
    id: 'improve-readme',
    severity: 'medium',
    categories: ['documentation'],
    checkIds: ['readme-quality'],
    impactLevel: 'important',
    effort: 'small',
    title: 'Expand README setup and usage details',
    description:
      'Add installation/setup and usage/examples sections so the README explains how to run and validate the project.',
    action: 'Add setup and usage sections to the existing README.',
    isApplicable: (signals) => signals.readme.exists && isReadmeIncomplete(signals),
    getSource: (signals) => signals.readme.path ?? undefined,
  },
  {
    id: 'add-lint-script',
    severity: 'medium',
    categories: ['maintainability'],
    checkIds: ['lint-script'],
    impactLevel: 'important',
    effort: 'small',
    title: 'Add a lint script',
    description: 'Expose linting in package.json to make code quality checks repeatable.',
    action: 'Add a package.json lint script that runs the configured linter.',
    isApplicable: (signals) =>
      signals.packageJson.exists && !signals.packageJson.scripts.lint.exists,
    getSource: (signals) => signals.packageJson.path ?? undefined,
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'add-a11y-tooling',
    severity: 'medium',
    categories: ['accessibility'],
    checkIds: ['a11y-tooling'],
    impactLevel: 'important',
    effort: 'medium',
    title: 'Add accessibility checks',
    description:
      'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
    action: 'Add accessibility linting or test tooling and wire it into regular frontend checks.',
    isApplicable: (signals) => !signals.a11yTooling.found,
    getSource: (signals) => firstToolingSource(signals.a11yTooling.sources),
  },
  {
    id: 'add-bundler',
    severity: 'medium',
    categories: ['performance'],
    checkIds: ['bundler'],
    impactLevel: 'important',
    effort: 'medium',
    title: 'Declare frontend build tooling',
    description:
      'Add or expose a frontend bundler such as Vite, Next.js, Webpack or Parcel so build readiness is easier to verify.',
    action: 'Declare the frontend bundler in package metadata or config files.',
    isApplicable: (signals) => signals.packageJson.exists && !signals.bundler.found,
    getSource: (signals) => signals.packageJson.path ?? undefined,
  },
  {
    id: 'commit-lockfile',
    severity: 'medium',
    categories: ['dependencies'],
    checkIds: ['lockfile'],
    impactLevel: 'important',
    effort: 'small',
    title: 'Commit a package lockfile',
    description: 'A lockfile keeps dependency installs reproducible across machines and CI.',
    action: 'Generate and commit the lockfile for the package manager used by this project.',
    isApplicable: (signals) => signals.packageJson.exists && !signals.lockfile.exists,
    getSource: (signals) => signals.packageJson.path ?? undefined,
  },
  {
    id: 'remove-mixed-lockfiles',
    severity: 'medium',
    categories: ['dependencies'],
    checkIds: ['lockfile-consistency'],
    impactLevel: 'important',
    effort: 'small',
    title: 'Use one package manager lockfile',
    description:
      'Keep one package manager lockfile so local and CI installs resolve dependencies consistently.',
    action: 'Remove extra lockfiles and keep the one that matches the chosen package manager.',
    isApplicable: (signals) => signals.dependencyHealth.hasMixedLockfiles,
    getSource: (signals) =>
      firstSource(...signals.dependencyHealth.lockfiles.map((lockfile) => lockfile.path)),
  },
  {
    id: 'align-package-manager',
    severity: 'medium',
    categories: ['dependencies'],
    checkIds: ['package-manager'],
    impactLevel: 'important',
    effort: 'small',
    title: 'Align package manager metadata',
    description: 'Make package.json packageManager match the committed lockfile package manager.',
    action: 'Update packageManager metadata or regenerate the lockfile so both point to one tool.',
    isApplicable: (signals) => signals.dependencyHealth.packageManagerMismatch,
    getSource: (signals) => signals.dependencyHealth.declaredPackageManagerSource ?? undefined,
  },
  {
    id: 'move-tooling-to-dev-dependencies',
    severity: 'medium',
    categories: ['dependencies'],
    checkIds: ['dependency-hygiene'],
    impactLevel: 'important',
    effort: 'small',
    title: 'Move tooling to devDependencies',
    description:
      'Keep linting, testing and type tooling out of production dependencies where possible.',
    action: 'Move detected build/test/lint/type packages from dependencies to devDependencies.',
    isApplicable: (signals) => signals.dependencyHealth.misplacedDevDependencySources.length > 0,
    getSource: (signals) => firstSource(...signals.dependencyHealth.misplacedDevDependencySources),
  },
  {
    id: 'ignore-secret-files',
    severity: 'medium',
    categories: ['security'],
    checkIds: ['security-gitignore'],
    impactLevel: 'important',
    effort: 'small',
    title: 'Ignore local secret files',
    description:
      'Add .env*, .npmrc and private key patterns to .gitignore so local credentials are harder to commit accidentally.',
    action: 'Add env, npmrc and private-key patterns to .gitignore.',
    isApplicable: (signals) =>
      !signals.security.gitignore.exists ||
      !signals.security.gitignore.coversEnvFiles ||
      !signals.security.gitignore.coversNpmrc ||
      !signals.security.gitignore.coversPrivateKeys,
    getSource: (signals) => signals.security.gitignore.path ?? '.gitignore',
  },
  {
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
  },
  {
    id: 'add-env-example',
    severity: 'low',
    categories: ['documentation', 'security'],
    checkIds: ['env-example', 'security-env-documentation'],
    impactLevel: 'supporting',
    effort: 'small',
    title: 'Document environment variables',
    description: 'Add an .env.example file so setup requirements are clear for contributors.',
    action: 'Create or update .env.example with safe placeholder values for required variables.',
    isApplicable: (signals, context) =>
      !signals.envExample.exists &&
      (context.enabledCategorySet.has('documentation') || signals.security.envUsage.found),
    getSource: () => '.env.example',
  },
] as const satisfies readonly RecommendationDefinition[];

export const reportRecommendationIds = recommendationDefinitions.map((definition) => definition.id);

const resolveSeverity = (
  definition: RecommendationDefinition,
  signals: RepositorySignals,
  context: RecommendationContext,
) => {
  return typeof definition.severity === 'function'
    ? definition.severity(signals, context)
    : definition.severity;
};

const createRecommendation = (
  definition: RecommendationDefinition,
  signals: RepositorySignals,
  context: RecommendationContext,
): ReportRecommendation => {
  const source = definition.getSource?.(signals);

  return {
    id: definition.id,
    severity: resolveSeverity(definition, signals, context),
    categories: [...definition.categories],
    checkIds: [...definition.checkIds],
    impactLevel: definition.impactLevel,
    effort: definition.effort,
    title: definition.title,
    description: definition.description,
    action: definition.action,
    ...(source ? { source } : {}),
  };
};

const sortRecommendationsByPriority = (
  recommendations: Array<{
    definitionIndex: number;
    recommendation: ReportRecommendation;
  }>,
) => {
  return recommendations
    .sort((left, right) => {
      const severityDiff =
        recommendationSeverityOrder[left.recommendation.severity] -
        recommendationSeverityOrder[right.recommendation.severity];
      const impactDiff =
        recommendationImpactOrder[left.recommendation.impactLevel] -
        recommendationImpactOrder[right.recommendation.impactLevel];
      const effortDiff =
        recommendationEffortOrder[left.recommendation.effort] -
        recommendationEffortOrder[right.recommendation.effort];

      return (
        severityDiff || impactDiff || effortDiff || left.definitionIndex - right.definitionIndex
      );
    })
    .map(({ recommendation }) => recommendation);
};

export const buildRecommendations = (
  signals: RepositorySignals,
  enabledCategories: readonly ScoreCategory[] = defaultEnabledScoreCategories,
) => {
  const enabledCategorySet = new Set(normalizeEnabledScoreCategories(enabledCategories));
  const context: RecommendationContext = {
    enabledCategorySet,
  };

  return sortRecommendationsByPriority(
    recommendationDefinitions.flatMap((definition, definitionIndex) => {
      if (!definition.categories.some((category) => enabledCategorySet.has(category))) {
        return [];
      }

      if (!definition.isApplicable(signals, context)) {
        return [];
      }

      return [
        {
          definitionIndex,
          recommendation: createRecommendation(definition, signals, context),
        },
      ];
    }),
  );
};
