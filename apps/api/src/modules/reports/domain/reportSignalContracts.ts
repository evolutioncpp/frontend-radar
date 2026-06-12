import type { ProjectReport } from './reportSchemas.js';

export type SignalScope = 'project' | 'root' | 'github' | null;
export type ScriptName = 'build' | 'lint' | 'test';
export type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

export type ToolingSource =
  ProjectReport['tooling'][keyof ProjectReport['tooling']][number]['sources'][number];
export type ToolingSourceSection = NonNullable<ToolingSource['section']>;

export type CiCheckSignal = {
  found: boolean;
  sources: string[];
};

export type CiAnalysis = {
  analyzedWorkflowPaths: string[];
  build: CiCheckSignal;
  cache: CiCheckSignal;
  install: CiCheckSignal;
  isWorkflowAnalysisTruncated?: boolean;
  lint: CiCheckSignal;
  projectScope: CiCheckSignal;
  pullRequest: CiCheckSignal;
  push: CiCheckSignal;
  test: CiCheckSignal;
};

export type WorkflowFile = {
  content: string;
  name: string;
  path: string;
};

export type LockfileSignal = {
  packageManager: string | null;
  path: string;
  scope: SignalScope;
};

export type DependencyHealth = {
  declaredPackageManager: string | null;
  declaredPackageManagerSource: string | null;
  hasMixedLockfiles: boolean;
  lockfiles: LockfileSignal[];
  misplacedDevDependencies: string[];
  misplacedDevDependencySources: string[];
  packageManagerMismatch: boolean;
  primaryPackageManager: string | null;
};

export interface PathSignal {
  exists: boolean;
  path: string | null;
  scope?: SignalScope;
}

export interface ScriptSignal {
  exists: boolean;
  name: ScriptName;
  scope?: SignalScope;
  source: string | null;
  value: string | null;
}

export interface ToolSignal {
  configPaths: string[];
  dependencies: string[];
  found: boolean;
  projectSources?: ToolingSource[];
  rootSources?: ToolingSource[];
  sources: ToolingSource[];
}

export interface PackageJsonSignal {
  dependencies: string[];
  exists: boolean;
  path: string | null;
  scripts: Record<ScriptName, ScriptSignal>;
  scope?: SignalScope;
  workspaces?: string[];
}

export interface RepositorySignals {
  a11yTooling: ToolSignal;
  bundler: ToolSignal;
  ci: {
    exists: boolean;
    scope?: SignalScope;
    source: string | null;
    workflowNames: string[];
  };
  ciAnalysis: CiAnalysis;
  dependencyHealth: DependencyHealth;
  envExample: PathSignal;
  formatting: ToolSignal;
  frameworks: ToolSignal;
  isNestedProject: boolean;
  linting: ToolSignal;
  lockfile: PathSignal & {
    packageManager: string | null;
  };
  packageJson: PackageJsonSignal;
  projectPath: string;
  readme: PathSignal & {
    hasInstallSection: boolean;
    hasUsageSection: boolean;
    isSubstantial: boolean;
    length: number;
  };
  rootPackageJson: PackageJsonSignal;
  storybook: ToolSignal;
  testingLibrary: ToolSignal;
  typescript: ToolSignal;
  workspace?: {
    matched: boolean;
    source: string | null;
  };
}

export const reportAnalysisSourceIds = [
  'github-repository-metadata',
  'project-package-json',
  'root-package-json',
  'readme',
  'env-example',
  'lockfile',
  'lockfile-consistency',
  'package-manager',
  'dependency-hygiene',
  'github-actions',
  'ci-pr-trigger',
  'ci-install-step',
  'ci-quality-steps',
  'ci-project-scope',
  'build-script',
  'test-script',
  'lint-script',
  'typescript',
  'storybook',
  'frameworks',
  'bundler',
  'testing',
  'linting',
  'formatting',
  'accessibility',
] as const;

export type ReportAnalysisSourceId = (typeof reportAnalysisSourceIds)[number];

export const reportProjectDetectionSignalIds = [
  'project-package-json',
  'project-path-hint',
  'project-package-name',
  'project-frontend-dependency',
  'project-build-script',
  'project-test-script',
  'project-workspace',
] as const;

export type ReportProjectDetectionSignalId = (typeof reportProjectDetectionSignalIds)[number];
