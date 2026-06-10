import { describe, expect, it } from 'vitest';

import { buildRecommendations } from './reportRecommendations.js';

import type { RepositorySignals, ScriptSignal, ToolSignal } from './reportSignals.js';

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

const createToolSignal = (sources: string[] = []): ToolSignal => ({
  configPaths: [],
  dependencies: sources,
  found: sources.length > 0,
  projectSources: sources,
  rootSources: [],
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
  storybook: createToolSignal(['storybook']),
  testingLibrary: createToolSignal(['@testing-library/react']),
  typescript: createToolSignal(['tsconfig.json', 'typescript']),
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
});
