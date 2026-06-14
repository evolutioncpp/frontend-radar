import { describe, expect, it } from 'vitest';

import { buildScoreBreakdown } from './reportScoreCalculator.js';

import type {
  RepositorySignals,
  ScriptSignal,
  ToolSignal,
} from '../domain/reportSignalContracts.js';

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

const createFoundToolSignal = (raw = 'package.json devDependencies.tool'): ToolSignal => ({
  configPaths: [],
  dependencies: ['tool'],
  found: true,
  projectSources: [
    {
      kind: 'dependency',
      label: raw,
      raw,
    },
  ],
  sources: [
    {
      kind: 'dependency',
      label: raw,
      raw,
    },
  ],
});

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
      found: false,
      sources: [],
    },
    entrypoints: {
      found: false,
      sources: [],
    },
    errorBoundaries: {
      found: false,
      sources: [],
    },
    files: {
      count: 0,
      isTruncated: false,
      sources: [],
    },
  },
  storybook: emptyToolSignal,
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
  testingLibrary: emptyToolSignal,
  typescript: emptyToolSignal,
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

const getMetric = (signals: RepositorySignals, category: string) => {
  const metric = buildScoreBreakdown(signals).find((item) => item.category === category);

  if (!metric) {
    throw new Error(`Metric ${category} was not found.`);
  }

  return metric;
};

describe('buildScoreBreakdown', () => {
  it('returns only enabled score categories', () => {
    const scoreBreakdown = buildScoreBreakdown(createSignals(), ['testing', 'dependencies']);

    expect(scoreBreakdown.map((metric) => metric.category)).toEqual(['testing', 'dependencies']);
  });

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

  it('does not allow testing to be excellent when no test files are found', () => {
    const metric = getMetric(
      createSignals({
        packageJson: {
          dependencies: [],
          exists: true,
          path: 'package.json',
          scripts: {
            build: createScriptSignal('build'),
            lint: createScriptSignal('lint'),
            test: createScriptSignal('test', 'vitest run'),
          },
        },
        testingLibrary: createFoundToolSignal('package.json devDependencies.vitest'),
      }),
      'testing',
    );

    expect(metric.value).toBeLessThan(90);
    expect(metric.scoreDetails.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'test-files',
          status: 'failed',
        }),
      ]),
    );
  });

  it('marks testing as excellent when script tooling test files and coverage are present', () => {
    const metric = getMetric(
      createSignals({
        packageJson: {
          dependencies: [],
          exists: true,
          path: 'package.json',
          scripts: {
            build: createScriptSignal('build'),
            lint: createScriptSignal('lint'),
            test: createScriptSignal('test', 'vitest run --coverage'),
          },
        },
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
        testingLibrary: createFoundToolSignal('package.json devDependencies.vitest'),
      }),
      'testing',
    );

    expect(metric).toMatchObject({
      status: 'excellent',
      value: 100,
    });
  });

  it('keeps maintainability below excellent when TypeScript is not strict and no typecheck script exists', () => {
    const metric = getMetric(
      createSignals({
        formatting: createFoundToolSignal('package.json devDependencies.prettier'),
        linting: createFoundToolSignal('package.json devDependencies.eslint'),
        packageJson: {
          dependencies: [],
          exists: true,
          path: 'package.json',
          scripts: {
            build: createScriptSignal('build'),
            lint: createScriptSignal('lint', 'eslint .'),
            test: createScriptSignal('test'),
          },
        },
        sourceCode: {
          ...createSignals().sourceCode,
          files: {
            count: 3,
            isTruncated: false,
            sources: ['src/main.tsx'],
          },
        },
        storybook: createFoundToolSignal('package.json devDependencies.storybook'),
        typescript: createFoundToolSignal('package.json devDependencies.typescript'),
        typescriptQuality: {
          config: {
            allowJs: null,
            configPaths: ['tsconfig.json'],
            exists: true,
            hasMissingConfig: false,
            hasParseError: false,
            noImplicitAny: false,
            noUncheckedIndexedAccess: null,
            parseError: false,
            path: 'tsconfig.json',
            scope: 'project',
            strict: false,
            strictNullChecks: false,
          },
          typecheck: {
            exists: false,
            scope: null,
            source: null,
            value: null,
          },
        },
      }),
      'maintainability',
    );

    expect(metric.value).toBeLessThan(90);
    expect(metric.scoreDetails.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'typescript-strict',
          status: 'partial',
        }),
        expect.objectContaining({
          id: 'typecheck-script',
          status: 'failed',
        }),
      ]),
    );
  });

  it('marks maintainability as excellent with strict TypeScript typecheck lint and formatting', () => {
    const metric = getMetric(
      createSignals({
        formatting: createFoundToolSignal('package.json devDependencies.prettier'),
        linting: createFoundToolSignal('package.json devDependencies.eslint'),
        packageJson: {
          dependencies: [],
          exists: true,
          path: 'package.json',
          scripts: {
            build: createScriptSignal('build'),
            lint: createScriptSignal('lint', 'eslint .'),
            test: createScriptSignal('test'),
          },
        },
        sourceCode: {
          ...createSignals().sourceCode,
          files: {
            count: 3,
            isTruncated: false,
            sources: ['src/main.tsx'],
          },
        },
        typescript: createFoundToolSignal('package.json devDependencies.typescript'),
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
      }),
      'maintainability',
    );

    expect(metric).toMatchObject({
      status: 'excellent',
    });
  });

  it('keeps performance excellent without code splitting when build readiness is otherwise complete', () => {
    const metric = getMetric(
      createSignals({
        bundler: createFoundToolSignal('package.json devDependencies.vite'),
        ciAnalysis: {
          ...createFullCiAnalysis(),
          build: createCiCheck(['.github/workflows/ci.yml']),
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
      'performance',
    );

    expect(metric).toMatchObject({
      status: 'excellent',
      value: 95,
    });
  });
});
