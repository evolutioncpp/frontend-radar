import type {
  GithubRepositoryReader,
  PackageJson,
} from '../../infrastructure/github/githubRepositoryReader.js';
import type { CiAnalysis } from '../ci/reportCiAnalyzer.js';
import type { DependencyHealth } from '../dependencies/reportDependencyAnalyzer.js';
import type { ToolingSource } from '../tooling/reportToolingSources.js';

export type SignalScope = 'project' | 'root' | 'github' | null;
export type ScriptName = 'build' | 'lint' | 'test';
export type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

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

export type CollectRepositorySignalsInput = {
  branch: string;
  owner: string;
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
  rootPackageJson?: PackageJson | null;
};
