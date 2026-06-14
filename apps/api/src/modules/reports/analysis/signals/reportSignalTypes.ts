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
  ReportRepositoryReader,
  PackageJson,
} from '../../application/ports/reportRepositoryReader.js';

export type CollectRepositorySignalsInput = {
  branch: string;
  owner: string;
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
  rootPackageJson?: PackageJson | null;
};
