import { describe, expect, it } from 'vitest';

import { buildScoreBreakdown } from './reportScoreCalculator.js';

import type { RepositorySignals, ScriptSignal, ToolSignal } from './reportSignals.js';

const createScriptSignal = (
  name: ScriptSignal['name'],
  value: string | null = null,
): ScriptSignal => ({
  exists: value !== null,
  name,
  source: value ? `package.json scripts.${name}` : null,
  value,
});

const emptyToolSignal: ToolSignal = {
  configPaths: [],
  dependencies: [],
  found: false,
  sources: [],
};

const createSignals = (overrides: Partial<RepositorySignals> = {}): RepositorySignals => ({
  a11yTooling: emptyToolSignal,
  bundler: emptyToolSignal,
  ci: {
    exists: false,
    source: null,
    workflowNames: [],
  },
  envExample: {
    exists: false,
    path: null,
  },
  lockfile: {
    exists: false,
    packageManager: null,
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
  storybook: emptyToolSignal,
  testingLibrary: emptyToolSignal,
  typescript: emptyToolSignal,
  ...overrides,
});

const getMetric = (signals: RepositorySignals, category: string) => {
  const metric = buildScoreBreakdown(signals).find((item) => item.category === category);

  if (!metric) {
    throw new Error(`Metric ${category} was not found.`);
  }

  return metric;
};

describe('buildScoreBreakdown', () => {
  it('does not mark CI as excellent when a workflow exists without a build script', () => {
    const metric = getMetric(
      createSignals({
        ci: {
          exists: true,
          source: '.github/workflows/ci.yml',
          workflowNames: ['ci.yml'],
        },
      }),
      'ci',
    );

    expect(metric).toMatchObject({
      status: 'warning',
      value: 65,
    });
  });

  it('marks CI as excellent when workflow and build script both exist', () => {
    const metric = getMetric(
      createSignals({
        ci: {
          exists: true,
          source: '.github/workflows/ci.yml',
          workflowNames: ['ci.yml'],
        },
        packageJson: {
          dependencies: [],
          exists: true,
          path: 'package.json',
          scripts: {
            build: createScriptSignal('build', 'vite build'),
            lint: createScriptSignal('lint'),
            test: createScriptSignal('test'),
          },
        },
      }),
      'ci',
    );

    expect(metric).toMatchObject({
      status: 'excellent',
      value: 100,
    });
  });
});
