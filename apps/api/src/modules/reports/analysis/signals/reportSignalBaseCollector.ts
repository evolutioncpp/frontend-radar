import { repositorySignalConfig } from '../../domain/reportAnalysisConfig.js';
import { findScopedPath, findScopedPaths, readScopedTextFile } from './reportSignalPaths.js';

import type {
  ReportRepositoryReader,
  ReportRepositoryReaderContext,
} from '../../application/ports/reportRepositoryReader.js';

export const collectRepositoryBaseSignals = async ({
  branch,
  context = {},
  owner,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  owner: string;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
}) => {
  const [
    readmeFile,
    typescriptPath,
    workflowNames,
    envExample,
    lockfiles,
    storybookPath,
    bundlerConfigPath,
    lintingConfigPath,
    formattingConfigPath,
    testingConfigPath,
    accessibilityConfigPath,
    frameworkConfigPath,
  ] = await Promise.all([
    readScopedTextFile({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.readmePaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.typescriptPaths,
      projectPath,
      reader,
      repository,
    }),
    reader.listDirectoryFiles(
      owner,
      repository,
      branch,
      repositorySignalConfig.workflowsPath,
      context,
    ),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.envExamplePaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPaths({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.lockfilePaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.storybookPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.bundlerConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.lintingConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.formattingConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.testingConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.accessibilityConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      context,
      owner,
      paths: repositorySignalConfig.frameworkConfigPaths,
      projectPath,
      reader,
      repository,
    }),
  ]);

  return {
    accessibilityConfigPath,
    bundlerConfigPath,
    envExample,
    formattingConfigPath,
    frameworkConfigPath,
    lintingConfigPath,
    lockfiles,
    readmeFile,
    storybookPath,
    testingConfigPath,
    typescriptPath,
    workflowNames,
  };
};
