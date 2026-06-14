import {
  readmeQualityConfig,
  repositorySignalConfig,
  sourceCodeAnalysisConfig,
} from '../../domain/reportAnalysisConfig.js';

import { buildCiAnalysis } from '../ci/reportCiAnalyzer.js';
import { buildDependencyHealth } from '../dependencies/reportDependencyAnalyzer.js';
import { analyzeSourceCode } from '../source-code/reportSourceCodeAnalyzer.js';
import { scanProjectSourceFiles } from '../source-code/reportSourceScanner.js';
import { analyzeTestQuality } from '../source-code/reportTestQualityAnalyzer.js';
import {
  analyzeTypeScriptQuality,
  getRelatedTsconfigPaths,
  isTypeScriptConfigPath,
  type ScopedTsconfigFile,
} from '../source-code/reportTypeScriptQualityAnalyzer.js';
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

const listTypeScriptConfigPaths = async ({
  branch,
  context,
  owner,
  path,
  reader,
  repository,
}: {
  branch: string;
  context: GithubReaderContext;
  owner: string;
  path: string;
  reader: GithubRepositoryReader;
  repository: string;
}) => {
  if (typeof reader.listDirectoryEntries !== 'function') {
    return [];
  }

  const entries = await reader.listDirectoryEntries(owner, repository, branch, path, context);

  return entries
    .filter((entry) => entry.type === 'file')
    .map((entry) => entry.path)
    .filter((entryPath): entryPath is string => entryPath !== null)
    .filter(isTypeScriptConfigPath);
};

const readTypeScriptConfigGraph = async ({
  branch,
  context,
  initialPaths,
  owner,
  reader,
  repository,
  scope,
}: {
  branch: string;
  context: GithubReaderContext;
  initialPaths: string[];
  owner: string;
  reader: GithubRepositoryReader;
  repository: string;
  scope: NonNullable<RepositorySignals['typescriptQuality']['config']['scope']>;
}) => {
  const files: ScopedTsconfigFile[] = [];
  const missingPaths: string[] = [];
  const seenPaths = new Set<string>();
  const queue = initialPaths.map((path) => ({ depth: 0, path }));

  while (
    queue.length > 0 &&
    files.length + missingPaths.length < sourceCodeAnalysisConfig.tsconfigMaxFiles
  ) {
    const item = queue.shift();

    if (!item || seenPaths.has(item.path)) {
      continue;
    }

    seenPaths.add(item.path);
    const content = await reader.readTextFile(owner, repository, branch, item.path, context);

    if (content === null) {
      missingPaths.push(item.path);
      continue;
    }

    const file = {
      content,
      path: item.path,
      scope,
    } satisfies ScopedTsconfigFile;

    files.push(file);

    if (item.depth >= sourceCodeAnalysisConfig.tsconfigMaxDepth) {
      continue;
    }

    for (const relatedPath of getRelatedTsconfigPaths(file).paths) {
      if (!seenPaths.has(relatedPath)) {
        queue.push({
          depth: item.depth + 1,
          path: relatedPath,
        });
      }
    }
  }

  return {
    files,
    missingPaths,
  };
};

export const collectRepositorySignals = async ({
  branch,
  owner,
  packageJson,
  packageJsonPath,
  projectPath,
  reader,
  repository,
  rootPackageJson,
  onProgress,
  context = {},
}: {
  branch: string;
  context?: GithubReaderContext;
  onProgress?: (stage: 'source_scan' | 'workflow_analysis') => Promise<void> | void;
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
  await onProgress?.('source_scan');
  const sourceScan = await scanProjectSourceFiles({
    branch,
    owner,
    projectPath,
    reader,
    repository,
    context,
  });
  const validWorkflowNames = getValidWorkflowNames(workflowNames);
  await onProgress?.('workflow_analysis');
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
  const projectTsconfigPaths = await listTypeScriptConfigPaths({
    branch,
    context,
    owner,
    path: projectPath,
    reader,
    repository,
  });
  const rootFallbackTsconfigPaths =
    projectTsconfigPaths.length === 0 && isNestedProject
      ? await listTypeScriptConfigPaths({
          branch,
          context,
          owner,
          path: '',
          reader,
          repository,
        })
      : [];
  const initialTsconfigPaths = Array.from(
    new Set([
      ...projectTsconfigPaths,
      ...rootFallbackTsconfigPaths,
      ...(typescriptPath.path ? [typescriptPath.path] : []),
    ]),
  );
  const tsconfigGraph = await readTypeScriptConfigGraph({
    branch,
    context,
    initialPaths: initialTsconfigPaths,
    owner,
    reader,
    repository,
    scope: rootFallbackTsconfigPaths.length > 0 ? 'root' : 'project',
  });
  const sourceCode = analyzeSourceCode(sourceScan);
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
  const packageJsonSignal = createPackageJsonSignal({
    dependencies: projectDependencyNames,
    packageJson: projectPackageJson,
    path: packageJsonPath,
    scripts: scriptSignals,
    scope: 'project',
  });
  const testQuality = analyzeTestQuality({
    files: sourceScan.files,
    isTruncated: sourceScan.isTruncated,
    isNestedProject,
    projectPackageJson,
    projectPackageJsonPath: packageJsonPath,
    rootPackageJson: rootPackage,
  });
  const typescriptQuality = analyzeTypeScriptQuality({
    isNestedProject,
    missingTsconfigPaths: tsconfigGraph.missingPaths,
    projectPackageJson,
    projectPackageJsonPath: packageJsonPath,
    rootPackageJson: rootPackage,
    tsconfigFiles: tsconfigGraph.files,
  });

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
    packageJson: packageJsonSignal,
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
    sourceCode,
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
    testQuality,
    typescriptQuality,
    workspace,
  } satisfies RepositorySignals;
};
