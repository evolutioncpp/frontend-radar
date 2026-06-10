import { describe, expect, it } from 'vitest';

import { buildReportAnalysisSources } from './reportAnalysisSources.js';

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
  projectSources?: string[];
  rootSources?: string[];
} = {}): ToolSignal => ({
  configPaths,
  dependencies: [],
  found: configPaths.length + projectSources.length + rootSources.length > 0,
  projectSources,
  rootSources,
  sources: [...projectSources, ...rootSources],
});

const createSignals = (overrides: Partial<RepositorySignals> = {}): RepositorySignals => ({
  a11yTooling: createToolSignal(),
  bundler: createToolSignal({
    projectSources: ['apps/web/package.json devDependencies.vite'],
  }),
  ci: {
    exists: true,
    scope: 'github',
    source:
      '.github/workflows/ci.yml, .github/workflows/lint.yml, .github/workflows/test.yml, +1 more',
    workflowNames: ['ci.yml', 'lint.yml', 'test.yml', 'deploy.yml'],
  },
  envExample: {
    exists: true,
    path: '.env.example',
    scope: 'root',
  },
  formatting: createToolSignal({
    rootSources: ['package.json devDependencies.prettier'],
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
      ]),
    );
  });

  it('marks config-backed tooling source rows as file sources', () => {
    const sources = buildReportAnalysisSources(
      createSignals({
        bundler: createToolSignal({
          configPaths: ['apps/web/vite.config.ts'],
          projectSources: ['apps/web/vite.config.ts'],
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
});
