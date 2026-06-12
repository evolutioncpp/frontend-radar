export type {
  CiAnalysis,
  CiCheckSignal,
  DependencyHealth,
  DependencySection,
  LockfileSignal,
  PackageJsonSignal,
  PathSignal,
  RepositorySignals,
  ScriptName,
  ScriptSignal,
  SignalScope,
  ToolingSource,
  ToolingSourceSection,
  ToolSignal,
  WorkflowFile,
} from '../../domain/reportSignalContracts.js';

import type {
  GithubRepositoryReader,
  PackageJson,
} from '../../infrastructure/github/githubRepositoryReader.js';

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
