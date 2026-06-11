import { describe, expect, it } from 'vitest';

import { buildReportEvidenceMap } from './reportEvidence.js';

import type { RepositorySignals, ScriptSignal, ToolSignal } from './reportSignals.js';

const createScriptSignal = (name: ScriptSignal['name']): ScriptSignal => ({
  exists: false,
  name,
  scope: null,
  source: null,
  value: null,
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

const createSignals = (overrides: Partial<RepositorySignals> = {}): RepositorySignals => ({
  a11yTooling: emptyToolSignal,
  bundler: emptyToolSignal,
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
    exists: false,
    path: null,
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
    exists: false,
    path: null,
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

describe('buildReportEvidenceMap', () => {
  it('marks incomplete README as warning evidence', () => {
    const evidence = buildReportEvidenceMap(
      createSignals({
        readme: {
          exists: true,
          hasInstallSection: false,
          hasUsageSection: false,
          isSubstantial: false,
          length: 120,
          path: 'README.md',
        },
      }),
    );

    expect(evidence.readme).toEqual({
      description: 'README was found, but it is short or misses setup and usage details.',
      id: 'readme',
      label: 'README',
      source: 'README.md',
      status: 'warning',
    });
  });

  it('marks CI quality evidence as warning when workflow misses a test step', () => {
    const evidence = buildReportEvidenceMap(
      createSignals({
        ci: {
          exists: true,
          source: '.github/workflows/ci.yml',
          workflowNames: ['ci.yml'],
        },
        ciAnalysis: {
          analyzedWorkflowPaths: ['.github/workflows/ci.yml'],
          build: createCiCheck(['.github/workflows/ci.yml']),
          cache: createCiCheck(),
          install: createCiCheck(['.github/workflows/ci.yml']),
          lint: createCiCheck(['.github/workflows/ci.yml']),
          projectScope: createCiCheck(['.github/workflows/ci.yml']),
          pullRequest: createCiCheck(['.github/workflows/ci.yml']),
          push: createCiCheck(),
          test: createCiCheck(),
        },
      }),
    );

    expect(evidence['ci-test-step']).toMatchObject({
      id: 'ci-test-step',
      source: '.github/workflows/ci.yml',
      status: 'warning',
    });
  });

  it('marks dependency hygiene as warning when tooling lives in dependencies', () => {
    const evidence = buildReportEvidenceMap(
      createSignals({
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
          misplacedDevDependencies: ['eslint'],
          misplacedDevDependencySources: ['package.json dependencies.eslint'],
          packageManagerMismatch: false,
          primaryPackageManager: 'npm',
        },
      }),
    );

    expect(evidence['dependency-hygiene']).toMatchObject({
      source: 'package.json dependencies.eslint',
      status: 'warning',
    });
  });

  it('marks GitHub Actions evidence as warning when workflow analysis was truncated', () => {
    const evidence = buildReportEvidenceMap(
      createSignals({
        ci: {
          exists: true,
          source: '.github/workflows/ci.yml, +10 more',
          workflowNames: ['ci.yml'],
        },
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

    expect(evidence['github-actions']).toMatchObject({
      status: 'warning',
    });
  });
});
