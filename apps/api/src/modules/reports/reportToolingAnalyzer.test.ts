import { describe, expect, it } from 'vitest';

import { buildReportTooling } from './reportToolingAnalyzer.js';

import type { RepositorySignals, ScriptSignal, ToolSignal } from './reportSignals.js';

const createScriptSignal = (name: ScriptSignal['name']): ScriptSignal => ({
  exists: false,
  name,
  source: null,
  value: null,
});

const createToolSignal = ({
  configPaths = [],
  dependencies = [],
  projectSources = [],
  rootSources = [],
}: {
  configPaths?: string[];
  dependencies?: string[];
  projectSources?: string[];
  rootSources?: string[];
} = {}): ToolSignal => ({
  configPaths,
  dependencies,
  found: configPaths.length + projectSources.length + rootSources.length > 0,
  projectSources,
  rootSources,
  sources: [...projectSources, ...rootSources],
});

const createCiCheck = (sources: string[] = []) => ({
  found: sources.length > 0,
  sources,
});

const createSignals = (overrides: Partial<RepositorySignals> = {}): RepositorySignals => ({
  a11yTooling: createToolSignal({
    dependencies: ['eslint-plugin-jsx-a11y'],
    projectSources: ['package.json devDependencies.eslint-plugin-jsx-a11y'],
  }),
  bundler: createToolSignal({
    dependencies: ['vite'],
    projectSources: ['package.json devDependencies.vite'],
  }),
  ci: {
    exists: false,
    source: null,
    workflowNames: [],
  },
  ciAnalysis: {
    analyzedWorkflowPaths: [],
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
    declaredPackageManager: null,
    declaredPackageManagerSource: null,
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
    exists: false,
    path: null,
  },
  formatting: createToolSignal({
    dependencies: ['prettier'],
    rootSources: ['package.json devDependencies.prettier'],
  }),
  frameworks: createToolSignal({
    dependencies: ['react'],
    projectSources: ['package.json dependencies.react'],
  }),
  isNestedProject: true,
  linting: createToolSignal(),
  lockfile: {
    exists: true,
    packageManager: 'pnpm',
    path: 'pnpm-lock.yaml',
  },
  packageJson: {
    dependencies: [],
    exists: true,
    path: 'apps/web/package.json',
    scripts: {
      build: createScriptSignal('build'),
      lint: createScriptSignal('lint'),
      test: createScriptSignal('test'),
    },
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
      lint: createScriptSignal('lint'),
      test: createScriptSignal('test'),
    },
  },
  storybook: createToolSignal(),
  testingLibrary: createToolSignal({
    dependencies: ['vitest'],
    projectSources: ['apps/web/package.json devDependencies.vitest'],
  }),
  typescript: createToolSignal({
    dependencies: ['typescript'],
    projectSources: ['apps/web/tsconfig.json'],
  }),
  ...overrides,
});

describe('buildReportTooling', () => {
  it('builds detected frontend stack groups with project and root status', () => {
    const tooling = buildReportTooling(createSignals());

    expect(tooling.frameworks[0]).toMatchObject({
      label: 'react',
      status: 'found',
      sources: ['package.json dependencies.react'],
    });
    expect(tooling.packageManager[0]).toMatchObject({
      label: 'pnpm',
      status: 'found',
    });
    expect(tooling.formatting[0]).toMatchObject({
      label: 'prettier',
      status: 'warning',
      sources: ['package.json devDependencies.prettier'],
    });
    expect(tooling.linting[0]).toMatchObject({
      label: 'Not detected',
      status: 'missing',
    });
  });

  it('uses config paths as tooling sources when dependencies are not detected', () => {
    const tooling = buildReportTooling(
      createSignals({
        bundler: createToolSignal({
          configPaths: ['apps/web/vite.config.ts'],
          projectSources: ['apps/web/vite.config.ts'],
        }),
      }),
    );

    expect(tooling.bundlers[0]).toMatchObject({
      label: 'Frontend bundler',
      sources: ['apps/web/vite.config.ts'],
      status: 'found',
    });
  });
});
