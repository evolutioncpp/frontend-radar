import { sourceCodeAnalysisConfig } from '../../domain/reportAnalysisConfig.js';

import { analyzeSecurity } from '../security/reportSecurityAnalyzer.js';
import { analyzeSourceCode } from '../source-code/reportSourceCodeAnalyzer.js';
import { scanProjectSourceFiles } from '../source-code/reportSourceScanner.js';
import { analyzeTestQuality } from '../source-code/reportTestQualityAnalyzer.js';
import {
  getRelatedTsconfigPaths,
  isTypeScriptConfigPath,
  type ScopedTsconfigFile,
} from '../source-code/reportTypeScriptConfigParser.js';
import { analyzeTypeScriptQuality } from '../source-code/reportTypeScriptQualityAnalyzer.js';

import type {
  PackageJson,
  ReportRepositoryReader,
  ReportRepositoryReaderContext,
} from '../../application/ports/reportRepositoryReader.js';
import type { PathSignal, RepositorySignals } from './reportSignalTypes.js';

const listTypeScriptConfigPaths = async ({
  branch,
  context,
  owner,
  path,
  reader,
  repository,
}: {
  branch: string;
  context: ReportRepositoryReaderContext;
  owner: string;
  path: string;
  reader: ReportRepositoryReader;
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
  context: ReportRepositoryReaderContext;
  initialPaths: string[];
  owner: string;
  reader: ReportRepositoryReader;
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

export const collectSourceQualitySignals = async ({
  branch,
  context,
  envExample,
  isNestedProject,
  onProgress,
  owner,
  packageJsonPath,
  projectPackageJson,
  projectPath,
  reader,
  repository,
  rootPackageJson,
  typescriptPath,
}: {
  branch: string;
  context: ReportRepositoryReaderContext;
  envExample: PathSignal;
  isNestedProject: boolean;
  onProgress?: (
    stage: 'source_scan' | 'security_scan' | 'workflow_analysis',
  ) => Promise<void> | void;
  owner: string;
  packageJsonPath: string | null;
  projectPackageJson: PackageJson | null;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
  rootPackageJson: PackageJson | null;
  typescriptPath: PathSignal;
}) => {
  await onProgress?.('source_scan');
  const sourceScan = await scanProjectSourceFiles({
    branch,
    owner,
    projectPath,
    reader,
    repository,
    context,
  });
  await onProgress?.('security_scan');
  const security = await analyzeSecurity({
    branch,
    context,
    envExample,
    files: sourceScan.files,
    owner,
    projectPath,
    reader,
    repository,
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

  return {
    security,
    sourceCode: analyzeSourceCode(sourceScan),
    testQuality: analyzeTestQuality({
      files: sourceScan.files,
      isTruncated: sourceScan.isTruncated,
      isNestedProject,
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson,
    }),
    typescriptQuality: analyzeTypeScriptQuality({
      isNestedProject,
      missingTsconfigPaths: tsconfigGraph.missingPaths,
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson,
      tsconfigFiles: tsconfigGraph.files,
    }),
  };
};
