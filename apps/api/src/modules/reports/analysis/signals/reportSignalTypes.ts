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
  SecuritySecretPatternKind,
  SecuritySecretPatternMatch,
  SecuritySensitiveFile,
  SecuritySignals,
  SignalScope,
  SourceCodeHealth,
  SourceCodeSignalCheck,
  SourceCodeSignals,
  SourceFileSignal,
  TestQualitySignals,
  ToolingSource,
  ToolingSourceSection,
  ToolSignal,
  TypecheckSignal,
  TypeScriptQualitySignals,
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
