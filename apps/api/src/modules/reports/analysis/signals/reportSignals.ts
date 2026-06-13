import { readmeQualityConfig, repositorySignalConfig } from '../../domain/reportAnalysisConfig.js';

import { buildCiAnalysis } from '../ci/reportCiAnalyzer.js';
import { buildDependencyHealth } from '../dependencies/reportDependencyAnalyzer.js';
import {
  createEffectiveScriptSignal,
  createPackageJsonSignal,
  createScriptSignal,
  getDependencyNames,
  getDependencySourceMap,
  getWorkspaceMatch,
} from './reportSignalPackage.js';
import {
  createPathSignal,
  findScopedPath,
  findScopedPaths,
  getPrimaryLockfile,
  getValidWorkflowNames,
  getWorkflowSource,
  hasTextPattern,
  readScopedTextFile,
  readWorkflowFiles,
} from './reportSignalPaths.js';
import { buildScopedToolSignal } from './reportSignalTools.js';

import type {
  GithubReaderContext,
  GithubRepositoryReader,
  PackageJson,
} from '../../infrastructure/github/githubRepositoryReader.js';
import type { RepositorySignals, ScriptName, ScriptSignal } from './reportSignalTypes.js';

export type {
  CollectRepositorySignalsInput,
  DependencySection,
  PackageJsonSignal,
  PathSignal,
  RepositorySignals,
  ScriptName,
  ScriptSignal,
  SignalScope,
  ToolSignal,
} from './reportSignalTypes.js';

export const collectRepositorySignals = async ({
  branch,
  owner,
  packageJson,
  packageJsonPath,
  projectPath,
  reader,
  repository,
  rootPackageJson,
  context = {},
}: {
  branch: string;
  context?: GithubReaderContext;
  owner: string;
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
  rootPackageJson?: PackageJson | null;
}) => {
  const isNestedProject = projectPath !== '';
  const rootPackage = rootPackageJson ?? (isNestedProject ? null : packageJson);
  const workspace = getWorkspaceMatch(projectPath, rootPackage);
  const projectPackageJson = packageJson;
  const projectDependencyNames = getDependencyNames(projectPackageJson);
  const rootDependencyNames = isNestedProject ? getDependencyNames(rootPackage) : [];
  const projectDependencySourceMap = getDependencySourceMap(projectPackageJson, packageJsonPath);
  const rootDependencySourceMap = getDependencySourceMap(rootPackage, 'package.json');
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
      owner,
      paths: repositorySignalConfig.readmePaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.typescriptPaths,
      projectPath,
      reader,
      repository,
      context,
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
      owner,
      paths: repositorySignalConfig.envExamplePaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPaths({
      branch,
      owner,
      paths: repositorySignalConfig.lockfilePaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.storybookPaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.bundlerConfigPaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.lintingConfigPaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.formattingConfigPaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.testingConfigPaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.accessibilityConfigPaths,
      projectPath,
      reader,
      repository,
      context,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.frameworkConfigPaths,
      projectPath,
      reader,
      repository,
      context,
    }),
  ]);
  const validWorkflowNames = getValidWorkflowNames(workflowNames);
  const workflowFilesResult = await readWorkflowFiles({
    branch,
    owner,
    reader,
    repository,
    context,
    workflowNames: validWorkflowNames,
  });
  const primaryLockfile = getPrimaryLockfile(lockfiles);
  const dependencyHealth = buildDependencyHealth({
    lockfiles,
    packageJson: projectPackageJson,
    packageJsonPath,
    rootPackageJson: rootPackage,
  });
  const ciAnalysis = buildCiAnalysis({
    isWorkflowAnalysisTruncated: workflowFilesResult.isTruncated,
    projectPath,
    workflowFiles: workflowFilesResult.files,
  });
  const scriptSignals = {
    build: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'build',
      useRootFallback: isNestedProject,
    }),
    lint: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'lint',
      useRootFallback: isNestedProject,
    }),
    test: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'test',
      useRootFallback: isNestedProject,
    }),
  } satisfies Record<ScriptName, ScriptSignal>;

  return {
    a11yTooling: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.a11yDependencies,
      projectConfigPath:
        accessibilityConfigPath.scope === 'project' ? accessibilityConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath:
        accessibilityConfigPath.scope === 'root' ? accessibilityConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    bundler: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.bundlerDependencies,
      projectConfigPath: bundlerConfigPath.scope === 'project' ? bundlerConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: bundlerConfigPath.scope === 'root' ? bundlerConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    ci: {
      exists: validWorkflowNames.length > 0,
      scope: validWorkflowNames.length > 0 ? 'github' : null,
      source: getWorkflowSource(validWorkflowNames),
      workflowNames: validWorkflowNames,
    },
    ciAnalysis,
    dependencyHealth,
    envExample,
    formatting: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.formattingDependencies,
      projectConfigPath:
        formattingConfigPath.scope === 'project' ? formattingConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: formattingConfigPath.scope === 'root' ? formattingConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    frameworks: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.frameworkDependencies,
      projectConfigPath: frameworkConfigPath.scope === 'project' ? frameworkConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: frameworkConfigPath.scope === 'root' ? frameworkConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    isNestedProject,
    linting: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.lintingDependencies,
      projectConfigPath: lintingConfigPath.scope === 'project' ? lintingConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: lintingConfigPath.scope === 'root' ? lintingConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    lockfile: {
      ...primaryLockfile,
      packageManager: dependencyHealth.primaryPackageManager,
    },
    packageJson: createPackageJsonSignal({
      dependencies: projectDependencyNames,
      packageJson: projectPackageJson,
      path: packageJsonPath,
      scripts: scriptSignals,
      scope: 'project',
    }),
    projectPath,
    readme: {
      ...readmeFile,
      ...createPathSignal(readmeFile?.path ?? null, readmeFile?.scope ?? null),
      hasInstallSection: readmeFile
        ? hasTextPattern(readmeFile.content, readmeQualityConfig.installSectionPatterns)
        : false,
      hasUsageSection: readmeFile
        ? hasTextPattern(readmeFile.content, readmeQualityConfig.usageSectionPatterns)
        : false,
      isSubstantial: readmeFile
        ? readmeFile.content.length >= readmeQualityConfig.minLength
        : false,
      length: readmeFile?.content.length ?? 0,
    },
    rootPackageJson: createPackageJsonSignal({
      dependencies: rootDependencyNames,
      packageJson: rootPackage,
      path: isNestedProject && rootPackage ? 'package.json' : packageJsonPath,
      scripts: {
        build: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'build',
        }),
        lint: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'lint',
        }),
        test: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'test',
        }),
      },
      scope: isNestedProject ? 'root' : 'project',
    }),
    storybook: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.storybookDependencies,
      projectConfigPath: storybookPath.scope === 'project' ? storybookPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: storybookPath.scope === 'root' ? storybookPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    testingLibrary: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.testingDependencies,
      projectConfigPath: testingConfigPath.scope === 'project' ? testingConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: testingConfigPath.scope === 'root' ? testingConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    typescript: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.typescriptDependencies,
      projectConfigPath: typescriptPath.scope === 'project' ? typescriptPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: typescriptPath.scope === 'root' ? typescriptPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    workspace,
  } satisfies RepositorySignals;
};
