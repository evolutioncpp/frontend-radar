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

export type SourceFileKind = 'source' | 'test' | 'e2e' | 'config';

export type SourceFileSignal = {
  content: string;
  kind: SourceFileKind;
  path: string;
};

export type SourceCodeSignalCheck = {
  found: boolean;
  scope?: SignalScope;
  sources: string[];
};

export type SourceCodeHealth = {
  anyCount: number;
  consoleCount: number;
  eslintDisableCount: number;
  issueCount: number;
  sources: string[];
  todoCount: number;
};

export type SourceCodeSignals = {
  codeHealth: SourceCodeHealth;
  codeSplitting: SourceCodeSignalCheck;
  entrypoints: SourceCodeSignalCheck;
  errorBoundaries: SourceCodeSignalCheck;
  files: {
    count: number;
    isTruncated: boolean;
    sources: string[];
  };
};

export type SecuritySensitiveFile = {
  kind: 'env' | 'npmrc' | 'private_key';
  path: string;
  scope: Exclude<SignalScope, 'github' | null>;
};

export type SecuritySecretPatternKind =
  | 'aws_access_key'
  | 'generic_secret'
  | 'github_token'
  | 'jwt'
  | 'private_key';

export type SecuritySecretPatternMatch = {
  kind: SecuritySecretPatternKind;
  path: string;
};

export type SecuritySignals = {
  envUsage: SourceCodeSignalCheck & {
    withoutExample: boolean;
  };
  gitignore: PathSignal & {
    coversEnvFiles: boolean;
    coversNpmrc: boolean;
    coversPrivateKeys: boolean;
  };
  hardcodedSecrets: {
    count: number;
    found: boolean;
    isTruncated: boolean;
    matches: SecuritySecretPatternMatch[];
    sources: string[];
  };
  sensitiveFiles: {
    files: SecuritySensitiveFile[];
    found: boolean;
    sources: string[];
  };
};

export type TestQualitySignals = {
  coverage: SourceCodeSignalCheck;
  e2e: SourceCodeSignalCheck;
  files: {
    componentCount: number;
    count: number;
    e2eCount: number;
    isTruncated: boolean;
    sources: string[];
    unitCount: number;
  };
};

export type TypecheckSignal = {
  exists: boolean;
  scope: SignalScope;
  source: string | null;
  value: string | null;
};

export type TypeScriptConfigKind = 'source' | 'test' | 'tooling' | 'unknown';

export type TypeScriptQualitySignals = {
  config: {
    allowJs: boolean | null;
    configPaths: string[];
    exists: boolean;
    hasMissingConfig: boolean;
    hasParseError: boolean;
    noImplicitAny: boolean | null;
    noUncheckedIndexedAccess: boolean | null;
    parseError: boolean;
    path: string | null;
    scope: SignalScope;
    strict: boolean | null;
    strictNullChecks: boolean | null;
  };
  typecheck: TypecheckSignal;
};

export interface PackageJsonSignal {
  dependencies: string[];
  exists: boolean;
  path: string | null;
  rawScripts?: Record<string, string>;
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
    projectRelevance: {
      found: boolean;
      reasons: string[];
    };
  };
  rootPackageJson: PackageJsonSignal;
  security: SecuritySignals;
  sourceCode: SourceCodeSignals;
  storybook: ToolSignal;
  testQuality: TestQualitySignals;
  testingLibrary: ToolSignal;
  typescript: ToolSignal;
  typescriptQuality: TypeScriptQualitySignals;
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
  'source-files',
  'test-files',
  'test-coverage',
  'typescript-config',
  'typecheck-script',
  'code-health',
  'code-splitting',
  'security-sensitive-files',
  'security-secret-patterns',
  'security-env-documentation',
  'security-gitignore',
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
