import {
  ciWorkflowAnalysisConfig,
  repositorySignalConfig,
  sourcePreviewConfig,
} from '../../domain/reportAnalysisConfig.js';
import { joinRepositoryPath } from '../../infrastructure/github/githubRepositoryReader.js';
import { sortWorkflowNamesByAnalysisPriority } from '../ci/reportCiAnalyzer.js';
import { getPackageManagerFromLockfile } from '../dependencies/reportDependencyAnalyzer.js';

import type {
  GithubRepositoryReader,
  TextFileMatch,
} from '../../infrastructure/github/githubRepositoryReader.js';
import type { WorkflowFile } from '../ci/reportCiAnalyzer.js';
import type { LockfileSignal } from '../dependencies/reportDependencyAnalyzer.js';
import type { PathSignal, SignalScope } from './reportSignalTypes.js';

export const createPathSignal = (path: string | null, scope: SignalScope): PathSignal => ({
  exists: path !== null,
  path,
  scope: path ? scope : null,
});

export const hasTextPattern = (content: string, patterns: readonly RegExp[]) => {
  return patterns.some((pattern) => pattern.test(content));
};

const prefixPaths = (projectPath: string, paths: readonly string[]) => {
  return paths.map((path) => joinRepositoryPath(projectPath, path));
};

export const getWorkflowSource = (workflowNames: readonly string[]) => {
  if (workflowNames.length === 0) {
    return null;
  }

  const workflowPaths = workflowNames.map((workflowName) => `.github/workflows/${workflowName}`);

  if (workflowPaths.length <= sourcePreviewConfig.workflowPreviewLimit) {
    return workflowPaths.join(', ');
  }

  const visibleWorkflowPaths = workflowPaths.slice(0, sourcePreviewConfig.workflowPreviewLimit);
  const hiddenWorkflowCount = workflowPaths.length - visibleWorkflowPaths.length;

  return `${visibleWorkflowPaths.join(', ')}, +${hiddenWorkflowCount} more`;
};

export const getPrimaryLockfile = (lockfiles: readonly LockfileSignal[]) => {
  const primaryLockfile =
    lockfiles.find((lockfile) => lockfile.scope === 'project') ?? lockfiles[0] ?? null;

  return createPathSignal(primaryLockfile?.path ?? null, primaryLockfile?.scope ?? null);
};

export const getValidWorkflowNames = (workflowNames: readonly string[]) => {
  return workflowNames.filter((workflowName) => /\.ya?ml$/i.test(workflowName));
};

export const findScopedPath = async ({
  branch,
  owner,
  paths,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  paths: readonly string[];
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
}): Promise<PathSignal> => {
  if (!projectPath) {
    return createPathSignal(
      await reader.findFirstPath(owner, repository, branch, paths),
      'project',
    );
  }

  const projectPathMatch = await reader.findFirstPath(
    owner,
    repository,
    branch,
    prefixPaths(projectPath, paths),
  );

  if (projectPathMatch) {
    return createPathSignal(projectPathMatch, 'project');
  }

  return createPathSignal(await reader.findFirstPath(owner, repository, branch, paths), 'root');
};

export const findScopedPaths = async ({
  branch,
  owner,
  paths,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  paths: readonly string[];
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
}): Promise<LockfileSignal[]> => {
  if (!projectPath) {
    const existingPaths = await reader.findExistingPaths(owner, repository, branch, paths);

    return existingPaths.map((path) => ({
      packageManager: getPackageManagerFromLockfile(path),
      path,
      scope: 'project',
    }));
  }

  const projectPaths = await reader.findExistingPaths(
    owner,
    repository,
    branch,
    prefixPaths(projectPath, paths),
  );
  const rootPaths = await reader.findExistingPaths(owner, repository, branch, paths);

  return [
    ...projectPaths.map((path) => ({
      packageManager: getPackageManagerFromLockfile(path),
      path,
      scope: 'project' as const,
    })),
    ...rootPaths.map((path) => ({
      packageManager: getPackageManagerFromLockfile(path),
      path,
      scope: 'root' as const,
    })),
  ];
};

export const readWorkflowFiles = async ({
  branch,
  owner,
  reader,
  repository,
  workflowNames,
}: {
  branch: string;
  owner: string;
  reader: GithubRepositoryReader;
  repository: string;
  workflowNames: readonly string[];
}): Promise<{ files: WorkflowFile[]; isTruncated: boolean }> => {
  const prioritizedWorkflowNames = sortWorkflowNamesByAnalysisPriority(workflowNames);
  const workflowNamesToAnalyze = prioritizedWorkflowNames.slice(0, ciWorkflowAnalysisConfig.limit);
  const workflowFiles = await Promise.all(
    workflowNamesToAnalyze.map(async (workflowName) => {
      const path = `${repositorySignalConfig.workflowsPath}/${workflowName}`;
      const content = await reader.readTextFile(owner, repository, branch, path);

      return content === null
        ? null
        : {
            content,
            name: workflowName,
            path,
          };
    }),
  );

  return {
    files: workflowFiles.filter(
      (workflowFile): workflowFile is WorkflowFile => workflowFile !== null,
    ),
    isTruncated: prioritizedWorkflowNames.length > workflowNamesToAnalyze.length,
  };
};

export const readScopedTextFile = async ({
  branch,
  owner,
  paths,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  paths: readonly string[];
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
}): Promise<(TextFileMatch & { scope: SignalScope }) | null> => {
  if (!projectPath) {
    const file = await reader.readFirstTextFile(owner, repository, branch, paths);

    return file ? { ...file, scope: 'project' } : null;
  }

  const projectFile = await reader.readFirstTextFile(
    owner,
    repository,
    branch,
    prefixPaths(projectPath, paths),
  );

  if (projectFile) {
    return { ...projectFile, scope: 'project' };
  }

  const rootFile = await reader.readFirstTextFile(owner, repository, branch, paths);

  return rootFile ? { ...rootFile, scope: 'root' } : null;
};
