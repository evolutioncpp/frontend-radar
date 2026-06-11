import { describe, expect, it } from 'vitest';

import { buildReportAnalysisSources } from './reportAnalysisSources.js';
import {
  createDependencySource,
  createFileSource,
  type ToolingSource,
} from './reportToolingSources.js';

import type { RepositorySignals, ScriptSignal, ToolSignal } from './reportSignals.js';

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
  storybook: createToolSignal(),
  testingLibrary: createToolSignal(),
  typescript: createToolSignal(),
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
