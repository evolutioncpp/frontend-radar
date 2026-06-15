import { describe, expect, it } from 'vitest';

import { buildReportAnalysisSources } from './reportAnalysisSources.js';
import {
  createDependencySource,
  createFileSource,
  type ToolingSource,
} from '../tooling/reportToolingSources.js';

import type { RepositorySignals, ScriptSignal, ToolSignal } from '../signals/reportSignals.js';

const createScriptSignal = (
  name: ScriptSignal['name'],
  value: string | null = null,
  scope: ScriptSignal['scope'] = null,
): ScriptSignal => ({
  exists: value !== null,
  name,
  scope,
  source:
    value && scope
      ? `${scope === 'root' ? 'package.json' : 'apps/web/package.json'} scripts.${name}`
      : null,
  value,
});

const createToolSignal = ({
  configPaths = [],
  projectSources = [],
  rootSources = [],
}: {
  configPaths?: string[];
  projectSources?: ToolingSource[];
  rootSources?: ToolingSource[];
} = {}): ToolSignal => ({
  configPaths,
  dependencies: [],
  found: configPaths.length + projectSources.length + rootSources.length > 0,
  projectSources,
  rootSources,
  sources: [...projectSources, ...rootSources],
});

const dependencySource = (
  packageJsonPath: string,
  section: 'dependencies' | 'devDependencies',
  name: string,
) =>
  createDependencySource({
    name,
    packageJsonPath,
    section,
  });

const createCiCheck = (sources: string[] = []) => ({
  found: sources.length > 0,
  sources,
});

const createSignals = (overrides: Partial<RepositorySignals> = {}): RepositorySignals => ({
  a11yTooling: createToolSignal(),
  bundler: createToolSignal({
    projectSources: [dependencySource('apps/web/package.json', 'devDependencies', 'vite')],
  }),
  ci: {
    exists: true,
    scope: 'github',
    source:
      '.github/workflows/ci.yml, .github/workflows/lint.yml, .github/workflows/test.yml, +1 more',
    workflowNames: ['ci.yml', 'lint.yml', 'test.yml', 'deploy.yml'],
  },
  ciAnalysis: {
    analyzedWorkflowPaths: ['.github/workflows/ci.yml', '.github/workflows/lint.yml'],
    build: createCiCheck(['.github/workflows/ci.yml']),
    cache: createCiCheck(),
    install: createCiCheck(['.github/workflows/ci.yml']),
    lint: createCiCheck(['.github/workflows/lint.yml']),
    projectScope: createCiCheck(['.github/workflows/ci.yml']),
    pullRequest: createCiCheck(['.github/workflows/ci.yml']),
    push: createCiCheck(),
    test: createCiCheck(),
  },
  dependencyHealth: {
    declaredPackageManager: 'pnpm',
    declaredPackageManagerSource: 'package.json packageManager',
    hasMixedLockfiles: false,
    lockfiles: [
      {
        packageManager: 'pnpm',
        path: 'pnpm-lock.yaml',
        scope: 'root',
      },
    ],
    misplacedDevDependencies: [],
    misplacedDevDependencySources: [],
    packageManagerMismatch: false,
    primaryPackageManager: 'pnpm',
  },
  envExample: {
    exists: true,
    path: '.env.example',
    scope: 'root',
  },
  formatting: createToolSignal({
    rootSources: [dependencySource('package.json', 'devDependencies', 'prettier')],
  }),
  frameworks: createToolSignal(),
  isNestedProject: true,
  linting: createToolSignal(),
  lockfile: {
    exists: true,
    packageManager: 'pnpm',
    path: 'pnpm-lock.yaml',
    scope: 'root',
  },
  packageJson: {
    dependencies: [],
    exists: true,
    path: 'apps/web/package.json',
    scripts: {
      build: createScriptSignal('build', 'vite build', 'project'),
      lint: createScriptSignal('lint', 'eslint .', 'root'),
      test: createScriptSignal('test'),
    },
    scope: 'project',
  },
  projectPath: 'apps/web',
  readme: {
    exists: false,
    hasInstallSection: false,
    hasUsageSection: false,
    isSubstantial: false,
    length: 0,
    path: null,
    projectRelevance: {
      found: false,
      reasons: [],
    },
  },
  rootPackageJson: {
    dependencies: [],
    exists: true,
    path: 'package.json',
    scripts: {
      build: createScriptSignal('build'),
      lint: createScriptSignal('lint', 'eslint .', 'root'),
      test: createScriptSignal('test'),
    },
    scope: 'root',
  },
  security: {
    envUsage: {
      found: false,
      sources: [],
      withoutExample: false,
    },
    gitignore: {
      coversEnvFiles: true,
      coversNpmrc: true,
      coversPrivateKeys: true,
      exists: true,
      path: '.gitignore',
      scope: 'project',
    },
    hardcodedSecrets: {
      count: 0,
      found: false,
      isTruncated: false,
      matches: [],
      sources: [],
    },
    sensitiveFiles: {
      files: [],
      found: false,
      sources: [],
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
      sources: ['apps/web/src/main.tsx'],
    },
    entrypoints: {
      found: true,
      sources: ['apps/web/src/main.tsx'],
    },
    errorBoundaries: {
      found: false,
      sources: [],
    },
    files: {
      count: 3,
      isTruncated: false,
      sources: ['apps/web/src/main.tsx'],
    },
  },
  storybook: createToolSignal(),
  testQuality: {
    coverage: {
      found: false,
      sources: [],
    },
    e2e: {
      found: false,
      sources: [],
    },
    files: {
      componentCount: 0,
      count: 0,
      e2eCount: 0,
      isTruncated: false,
      sources: [],
      unitCount: 0,
    },
  },
  testingLibrary: createToolSignal(),
  typescript: createToolSignal(),
  typescriptQuality: {
    config: {
      allowJs: null,
      configPaths: [],
      exists: false,
      hasMissingConfig: false,
      hasParseError: false,
      noImplicitAny: null,
      noUncheckedIndexedAccess: null,
      parseError: false,
      path: null,
      scope: null,
      strict: null,
      strictNullChecks: null,
    },
    typecheck: {
      exists: false,
      scope: null,
      source: null,
      value: null,
    },
  },
  ...overrides,
});

describe('buildReportAnalysisSources', () => {
  it('builds source rows with scopes, warning fallbacks and compact sources', () => {
    const sources = buildReportAnalysisSources(createSignals());

    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'project-package-json',
          scope: 'project',
          status: 'found',
          source: 'apps/web/package.json',
        }),
        expect.objectContaining({
          id: 'root-package-json',
          scope: 'root',
          status: 'found',
        }),
        expect.objectContaining({
          id: 'env-example',
          scope: 'root',
          status: 'warning',
        }),
        expect.objectContaining({
          id: 'lint-script',
          scope: 'root',
          status: 'warning',
        }),
        expect.objectContaining({
          id: 'formatting',
          kind: 'dependency',
          source: 'package.json devDependencies.prettier',
          status: 'warning',
        }),
        expect.objectContaining({
          id: 'ci-quality-steps',
          status: 'warning',
        }),
        expect.objectContaining({
          id: 'package-manager',
          status: 'found',
        }),
      ]),
    );
  });

  it('marks config-backed tooling source rows as file sources', () => {
    const sources = buildReportAnalysisSources(
      createSignals({
        bundler: createToolSignal({
          configPaths: ['apps/web/vite.config.ts'],
          projectSources: [createFileSource('apps/web/vite.config.ts')],
        }),
      }),
    );

    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'bundler',
          kind: 'file',
          scope: 'project',
          source: 'apps/web/vite.config.ts',
          status: 'found',
        }),
      ]),
    );
  });

  it('marks root README as found when it clearly documents the selected frontend path', () => {
    const sources = buildReportAnalysisSources(
      createSignals({
        readme: {
          exists: true,
          hasInstallSection: true,
          hasUsageSection: true,
          isSubstantial: true,
          length: 1_200,
          path: 'README.md',
          projectRelevance: {
            found: true,
            reasons: ['project-path'],
          },
          scope: 'root',
        },
      }),
    );

    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'readme',
          scope: 'root',
          source: 'README.md',
          status: 'found',
        }),
      ]),
    );
  });

  it('deduplicates CI quality sources and marks truncated workflow analysis as warning', () => {
    const sources = buildReportAnalysisSources(
      createSignals({
        ciAnalysis: {
          analyzedWorkflowPaths: ['.github/workflows/ci.yml'],
          build: createCiCheck(['.github/workflows/ci.yml']),
          cache: createCiCheck(),
          install: createCiCheck(['.github/workflows/ci.yml']),
          isWorkflowAnalysisTruncated: true,
          lint: createCiCheck(['.github/workflows/ci.yml']),
          projectScope: createCiCheck(['.github/workflows/ci.yml']),
          pullRequest: createCiCheck(['.github/workflows/ci.yml']),
          push: createCiCheck(),
          test: createCiCheck(['.github/workflows/ci.yml']),
        },
      }),
    );

    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'github-actions',
          status: 'warning',
        }),
        expect.objectContaining({
          id: 'ci-quality-steps',
          source: '.github/workflows/ci.yml',
          status: 'found',
        }),
      ]),
    );
  });
});
