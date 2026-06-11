import { describe, expect, it } from 'vitest';

import { buildScoreBreakdown } from './reportScoreCalculator.js';

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

const emptyToolSignal: ToolSignal = {
  configPaths: [],
  dependencies: [],
  found: false,
  sources: [],
};

const createCiCheck = (sources: string[] = []) => ({
  found: sources.length > 0,
  sources,
});

const createCiAnalysis = (source = '.github/workflows/ci.yml') => ({
  analyzedWorkflowPaths: source ? [source] : [],
  build: createCiCheck(),
  cache: createCiCheck(),
  install: createCiCheck(),
  lint: createCiCheck(),
  projectScope: createCiCheck(),
  pullRequest: createCiCheck(),
  push: createCiCheck(),
  test: createCiCheck(),
});

const createFullCiAnalysis = (source = '.github/workflows/ci.yml') => ({
  analyzedWorkflowPaths: [source],
  build: createCiCheck([source]),
  cache: createCiCheck([source]),
  install: createCiCheck([source]),
  lint: createCiCheck([source]),
  projectScope: createCiCheck([source]),
  pullRequest: createCiCheck([source]),
  push: createCiCheck([source]),
  test: createCiCheck([source]),
});

const createSignals = (overrides: Partial<RepositorySignals> = {}): RepositorySignals => ({
  a11yTooling: emptyToolSignal,
  bundler: emptyToolSignal,
  ci: {
    exists: false,
    source: null,
    workflowNames: [],
  },
  ciAnalysis: createCiAnalysis(''),
  dependencyHealth: {
    declaredPackageManager: null,
    declaredPackageManagerSource: null,
    hasMixedLockfiles: false,
    lockfiles: [],
    misplacedDevDependencies: [],
    misplacedDevDependencySources: [],
    packageManagerMismatch: false,
    primaryPackageManager: null,
  },
  envExample: {
    exists: false,
    path: null,
  },
  formatting: emptyToolSignal,
  frameworks: emptyToolSignal,
  isNestedProject: false,
  linting: emptyToolSignal,
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
  projectPath: '',
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
  it('does not give high CI score when a workflow exists without quality steps', () => {
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
      status: 'critical',
      value: 27,
    });
    expect(metric.scoreDetails.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'github-actions',
          status: 'passed',
        }),
        expect.objectContaining({
          id: 'ci-test-step',
          status: 'failed',
        }),
      ]),
    );
  });

  it('marks CI as excellent when workflow runs PR install lint test and build steps', () => {
    const metric = getMetric(
      createSignals({
        ci: {
          exists: true,
          source: '.github/workflows/ci.yml',
          workflowNames: ['ci.yml'],
        },
        ciAnalysis: createFullCiAnalysis(),
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

  it('caps monorepo CI below excellent when workflow does not target the selected project', () => {
    const metric = getMetric(
      createSignals({
        ci: {
          exists: true,
          source: '.github/workflows/ci.yml',
          workflowNames: ['ci.yml'],
        },
        ciAnalysis: {
          ...createFullCiAnalysis(),
          projectScope: createCiCheck(),
        },
        isNestedProject: true,
        packageJson: {
          dependencies: [],
          exists: true,
          path: 'apps/web/package.json',
          scripts: {
            build: {
              ...createScriptSignal('build', 'npm run build:web'),
              scope: 'root',
              source: 'package.json scripts.build',
            },
            lint: createScriptSignal('lint'),
            test: createScriptSignal('test'),
          },
        },
        projectPath: 'apps/web',
      }),
      'ci',
    );

    expect(metric).toMatchObject({
      status: 'good',
      value: 89,
    });
    expect(metric.scoreDetails.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'ci-project-scope',
          status: 'partial',
        }),
      ]),
    );
    expect(metric.scoreDetails.cap).toMatchObject({
      value: 89,
    });
  });

  it('penalizes dependencies when lockfiles are mixed or package manager metadata mismatches', () => {
    const metric = getMetric(
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
        lockfile: {
          exists: true,
          packageManager: 'npm',
          path: 'package-lock.json',
        },
      }),
      'dependencies',
    );

    expect(metric).toMatchObject({
      status: 'warning',
      value: 67,
    });
  });

  it('scores documentation as zero when README and environment example are missing', () => {
    const metric = getMetric(createSignals(), 'documentation');

    expect(metric).toMatchObject({
      status: 'critical',
      value: 0,
    });
  });

  it('scores CI as zero when GitHub Actions workflows are missing', () => {
    const metric = getMetric(createSignals(), 'ci');

    expect(metric).toMatchObject({
      status: 'critical',
      value: 0,
    });
  });

  it('allows a root lockfile to be excellent when the selected package is workspace-managed', () => {
    const metric = getMetric(
      createSignals({
        dependencyHealth: {
          declaredPackageManager: null,
          declaredPackageManagerSource: null,
          hasMixedLockfiles: false,
          lockfiles: [
            {
              packageManager: 'npm',
              path: 'package-lock.json',
              scope: 'root',
            },
          ],
          misplacedDevDependencies: [],
          misplacedDevDependencySources: [],
          packageManagerMismatch: false,
          primaryPackageManager: 'npm',
        },
        isNestedProject: true,
        lockfile: {
          exists: true,
          packageManager: 'npm',
          path: 'package-lock.json',
          scope: 'root',
        },
        projectPath: 'apps/web',
        workspace: {
          matched: true,
          source: 'package.json workspaces.apps/*',
        },
      }),
      'dependencies',
    );

    expect(metric).toMatchObject({
      status: 'excellent',
      value: 100,
    });
  });

  it('caps dependencies below excellent when only an unrelated root lockfile is found', () => {
    const metric = getMetric(
      createSignals({
        dependencyHealth: {
          declaredPackageManager: null,
          declaredPackageManagerSource: null,
          hasMixedLockfiles: false,
          lockfiles: [
            {
              packageManager: 'npm',
              path: 'package-lock.json',
              scope: 'root',
            },
          ],
          misplacedDevDependencies: [],
          misplacedDevDependencySources: [],
          packageManagerMismatch: false,
          primaryPackageManager: 'npm',
        },
        isNestedProject: true,
        lockfile: {
          exists: true,
          packageManager: 'npm',
          path: 'package-lock.json',
          scope: 'root',
        },
        projectPath: 'apps/web',
      }),
      'dependencies',
    );

    expect(metric).toMatchObject({
      status: 'good',
      value: 87,
    });
    expect(metric.scoreDetails.cap).toMatchObject({
      value: 89,
    });
  });
});
