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
});
