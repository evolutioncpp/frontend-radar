import { describe, expect, it } from 'vitest';

import { buildRecommendations } from './reportRecommendations.js';

import type {
  RepositorySignals,
  ScriptSignal,
  ToolingSource,
  ToolSignal,
} from './reportSignalContracts.js';

const createScriptSignal = (
  name: ScriptSignal['name'],
  value: string | null = null,
): ScriptSignal => ({
  exists: value !== null,
  name,
  scope: value ? 'project' : null,
  source: value ? `package.json scripts.${name}` : null,
  value,
});

const createToolSignal = (sources: string[] = []): ToolSignal => {
  const toolingSources = sources.map(
    (source): ToolingSource => ({
      kind: 'dependency',
      label: source,
      name: source,
      raw: source,
    }),
  );

  return {
    configPaths: [],
    dependencies: sources,
    found: sources.length > 0,
    projectSources: toolingSources,
    rootSources: [],
    sources: toolingSources,
  };
};

const createCiCheck = (sources: string[] = ['.github/workflows/ci.yml']) => ({
  found: sources.length > 0,
  sources,
});

const createSignals = (overrides: Partial<RepositorySignals> = {}): RepositorySignals => ({
  a11yTooling: createToolSignal(['eslint-plugin-jsx-a11y']),
  bundler: createToolSignal(['vite']),
  ci: {
    exists: true,
    source: '.github/workflows/ci.yml',
    workflowNames: ['ci.yml'],
  },
  ciAnalysis: {
    analyzedWorkflowPaths: ['.github/workflows/ci.yml'],
    build: createCiCheck(),
    cache: createCiCheck(),
    install: createCiCheck(),
    lint: createCiCheck(),
    projectScope: createCiCheck(),
    pullRequest: createCiCheck(),
    push: createCiCheck(),
    test: createCiCheck(),
  },
  dependencyHealth: {
    declaredPackageManager: 'npm',
    declaredPackageManagerSource: 'package.json packageManager',
    hasMixedLockfiles: false,
    lockfiles: [
      {
        packageManager: 'npm',
        path: 'package-lock.json',
        scope: 'project',
      },
    ],
    misplacedDevDependencies: [],
    misplacedDevDependencySources: [],
    packageManagerMismatch: false,
    primaryPackageManager: 'npm',
  },
  envExample: {
    exists: true,
    path: '.env.example',
  },
  formatting: createToolSignal(['prettier']),
  frameworks: createToolSignal(['react']),
  isNestedProject: false,
  linting: createToolSignal(['eslint']),
  lockfile: {
    exists: true,
    packageManager: 'npm',
    path: 'package-lock.json',
  },
  packageJson: {
    dependencies: ['@testing-library/react', 'eslint-plugin-jsx-a11y', 'typescript', 'vite'],
    exists: true,
    path: 'package.json',
    scripts: {
      build: createScriptSignal('build', 'vite build'),
      lint: createScriptSignal('lint', 'eslint .'),
      test: createScriptSignal('test', 'vitest run'),
    },
  },
  projectPath: '',
  readme: {
    exists: true,
    hasInstallSection: true,
    hasUsageSection: true,
    isSubstantial: true,
    length: 900,
    path: 'README.md',
  },
  rootPackageJson: {
    dependencies: ['@testing-library/react', 'eslint-plugin-jsx-a11y', 'typescript', 'vite'],
    exists: true,
    path: 'package.json',
    scripts: {
      build: createScriptSignal('build', 'vite build'),
      lint: createScriptSignal('lint', 'eslint .'),
      test: createScriptSignal('test', 'vitest run'),
    },
  },
  sourceCode: {
    codeHealth: {
      anyCount: 0,
      consoleCount: 0,
      eslintDisableCount: 0,
      issueCount: 0,
      sources: [],
      todoCount: 0,
    },
    codeSplitting: {
      found: true,
      sources: ['src/main.tsx'],
    },
    entrypoints: {
      found: true,
      sources: ['src/main.tsx'],
    },
    errorBoundaries: {
      found: true,
      sources: ['src/ErrorBoundary.tsx'],
    },
    files: {
      count: 4,
      isTruncated: false,
      sources: ['src/main.tsx'],
    },
  },
  storybook: createToolSignal(['storybook']),
  testQuality: {
    coverage: {
      found: true,
      sources: ['package.json scripts.test'],
    },
    e2e: {
      found: false,
      sources: [],
    },
    files: {
      componentCount: 1,
      count: 2,
      e2eCount: 0,
      isTruncated: false,
      sources: ['src/App.test.tsx'],
      unitCount: 2,
    },
  },
  testingLibrary: createToolSignal(['@testing-library/react']),
  typescript: createToolSignal(['tsconfig.json', 'typescript']),
  typescriptQuality: {
    config: {
      allowJs: false,
      configPaths: ['tsconfig.json'],
      exists: true,
      hasMissingConfig: false,
      hasParseError: false,
      noImplicitAny: null,
      noUncheckedIndexedAccess: true,
      parseError: false,
      path: 'tsconfig.json',
      scope: 'project',
      strict: true,
      strictNullChecks: null,
    },
    typecheck: {
      exists: true,
      scope: 'project',
      source: 'package.json scripts.typecheck',
      value: 'tsc --noEmit',
    },
  },
  ...overrides,
});

describe('buildRecommendations', () => {
  it('returns no recommendations for a project with core quality signals', () => {
    expect(buildRecommendations(createSignals())).toEqual([]);
  });

  it('prioritizes delivery and test blockers before medium and low recommendations', () => {
    const recommendations = buildRecommendations(
      createSignals({
        ci: {
          exists: false,
          source: null,
          workflowNames: [],
        },
        envExample: {
          exists: false,
          path: null,
        },
        packageJson: {
          dependencies: [],
          exists: true,
          path: 'package.json',
          scripts: {
            build: createScriptSignal('build'),
            lint: createScriptSignal('lint'),
            test: createScriptSignal('test'),
          },
        },
        readme: {
          exists: false,
          hasInstallSection: false,
          hasUsageSection: false,
          isSubstantial: false,
          length: 0,
          path: null,
        },
        storybook: createToolSignal(),
        typescript: createToolSignal(),
      }),
    );

    expect(recommendations.map((recommendation) => recommendation.id).slice(0, 3)).toEqual([
      'add-github-actions',
      'add-test-script',
      'add-build-script',
    ]);
    expect(recommendations.map((recommendation) => recommendation.severity)).toEqual([
      'high',
      'high',
      'high',
      'medium',
      'medium',
      'medium',
      'low',
      'low',
    ]);
  });

  it('adds actionable recommendations from structured README, tooling and dependency signals', () => {
    const recommendations = buildRecommendations(
      createSignals({
        a11yTooling: createToolSignal(),
        bundler: createToolSignal(),
        lockfile: {
          exists: false,
          packageManager: null,
          path: null,
        },
        readme: {
          exists: true,
          hasInstallSection: false,
          hasUsageSection: true,
          isSubstantial: false,
          length: 120,
          path: 'README.md',
        },
        storybook: createToolSignal(),
        testingLibrary: createToolSignal(),
        typescript: createToolSignal(),
      }),
    );

    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'improve-readme',
          severity: 'medium',
        }),
        expect.objectContaining({
          id: 'add-testing-library',
          severity: 'medium',
        }),
        expect.objectContaining({
          id: 'add-a11y-tooling',
          severity: 'medium',
        }),
        expect.objectContaining({
          id: 'add-bundler',
          severity: 'medium',
        }),
        expect.objectContaining({
          id: 'commit-lockfile',
          severity: 'medium',
        }),
        expect.objectContaining({
          id: 'add-storybook',
          severity: 'low',
        }),
      ]),
    );
  });

  it('adds targeted recommendations when CI workflow misses important steps', () => {
    const recommendations = buildRecommendations(
      createSignals({
        ciAnalysis: {
          analyzedWorkflowPaths: ['.github/workflows/ci.yml'],
          build: createCiCheck([]),
          cache: createCiCheck([]),
          install: createCiCheck(['.github/workflows/ci.yml']),
          lint: createCiCheck([]),
          projectScope: createCiCheck([]),
          pullRequest: createCiCheck([]),
          push: createCiCheck(['.github/workflows/ci.yml']),
          test: createCiCheck([]),
        },
        isNestedProject: true,
        projectPath: 'apps/web',
      }),
    );

    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'add-ci-pr-checks', severity: 'medium' }),
        expect.objectContaining({ id: 'add-ci-lint-step', severity: 'medium' }),
        expect.objectContaining({ id: 'add-ci-test-step', severity: 'high' }),
        expect.objectContaining({ id: 'add-ci-build-step', severity: 'high' }),
        expect.objectContaining({ id: 'scope-ci-to-frontend-path', severity: 'medium' }),
      ]),
    );
  });

  it('adds dependency recommendations for mixed lockfiles and package manager mismatch', () => {
    const recommendations = buildRecommendations(
      createSignals({
        dependencyHealth: {
          declaredPackageManager: 'pnpm',
          declaredPackageManagerSource: 'package.json packageManager',
          hasMixedLockfiles: true,
          lockfiles: [
            {
              packageManager: 'npm',
              path: 'package-lock.json',
              scope: 'project',
            },
            {
              packageManager: 'pnpm',
              path: 'pnpm-lock.yaml',
              scope: 'project',
            },
          ],
          misplacedDevDependencies: ['eslint'],
          misplacedDevDependencySources: ['package.json dependencies.eslint'],
          packageManagerMismatch: true,
          primaryPackageManager: 'npm',
        },
      }),
    );

    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'remove-mixed-lockfiles' }),
        expect.objectContaining({ id: 'align-package-manager' }),
        expect.objectContaining({ id: 'move-tooling-to-dev-dependencies' }),
      ]),
    );
  });
});
