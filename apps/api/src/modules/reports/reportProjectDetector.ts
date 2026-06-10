import { repositorySignalConfig } from './reportAnalysisConfig.js';
import { joinRepositoryPath } from './githubRepositoryReader.js';

import type { GithubRepositoryReader, PackageJson } from './githubRepositoryReader.js';

export interface ReportProjectContext {
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectPath: string;
  rootPackageJson: PackageJson | null;
}

export class ReportProjectPathNotFoundError extends Error {
  constructor(projectPath: string) {
    super(`Frontend project package.json was not found at ${projectPath}`);
    this.name = 'ReportProjectPathNotFoundError';
  }
}

export const isReportProjectPathNotFoundError = (
  error: unknown,
): error is ReportProjectPathNotFoundError => {
  return error instanceof ReportProjectPathNotFoundError;
};

const dependencySections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;
const frontendPathSegmentSet = new Set<string>(repositorySignalConfig.frontendPathSegments);

const normalizeProjectPath = (path: string) => {
  const normalizedPath = joinRepositoryPath(
    path.replace(/\\/g, '/').replace(/\/package\.json$/i, ''),
  );

  return normalizedPath === '.' ? '' : normalizedPath;
};

const uniquePaths = (paths: readonly string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const path of paths) {
    const normalizedPath = normalizeProjectPath(path);

    if (seen.has(normalizedPath)) {
      continue;
    }

    seen.add(normalizedPath);
    result.push(normalizedPath);
  }

  return result;
};

const getDependencyNames = (packageJson: PackageJson | null) => {
  if (!packageJson) {
    return [];
  }

  return dependencySections.flatMap((section) => Object.keys(packageJson[section] ?? {}));
};

const getScriptNames = (packageJson: PackageJson | null) => {
  if (!packageJson?.scripts) {
    return [];
  }

  return Object.keys(packageJson.scripts);
};

const hasAnyMatch = (values: readonly string[], expectedValues: readonly string[]) => {
  const valueSet = new Set(values);

  return expectedValues.some((value) => valueSet.has(value));
};

const getPathHintScore = (projectPath: string) => {
  if (!projectPath) {
    return 0;
  }

  const segments = projectPath.toLowerCase().split('/');

  return segments.some((segment) => frontendPathSegmentSet.has(segment)) ? 24 : 0;
};

const getNameHintScore = (packageJson: PackageJson | null) => {
  const packageName = packageJson?.name?.toLowerCase();

  if (!packageName) {
    return 0;
  }

  return [...frontendPathSegmentSet].some((segment) => packageName.includes(segment)) ? 18 : 0;
};

const getProjectScore = (projectPath: string, packageJson: PackageJson | null) => {
  if (!packageJson) {
    return Number.NEGATIVE_INFINITY;
  }

  const dependencies = getDependencyNames(packageJson);
  const scripts = getScriptNames(packageJson);
  const hasFrontendDependency = hasAnyMatch(
    dependencies,
    repositorySignalConfig.frontendDependencies,
  );
  const hasBuildScript = scripts.includes('build');
  const hasTestScript = scripts.includes('test');

  return (
    10 +
    (projectPath ? 8 : 0) +
    getPathHintScore(projectPath) +
    getNameHintScore(packageJson) +
    (hasFrontendDependency ? 45 : 0) +
    (hasBuildScript ? 8 : 0) +
    (hasTestScript ? 5 : 0)
  );
};

const getWorkspacePatterns = (rootPackageJson: PackageJson | null) => {
  return rootPackageJson?.workspaces ?? [];
};

const expandWorkspacePattern = async ({
  branch,
  owner,
  pattern,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  pattern: string;
  reader: GithubRepositoryReader;
  repository: string;
}) => {
  const normalizedPattern = normalizeProjectPath(pattern);

  if (!normalizedPattern.includes('*')) {
    return [normalizedPattern];
  }

  if (!normalizedPattern.endsWith('/*')) {
    return [];
  }

  const basePath = normalizedPattern.slice(0, -2);
  const entries = await reader.listDirectoryEntries(owner, repository, branch, basePath);

  return entries
    .filter((entry) => entry.type === 'dir')
    .map((entry) => normalizeProjectPath(entry.path));
};

const getCandidateProjectPaths = async ({
  branch,
  owner,
  reader,
  repository,
  rootPackageJson,
}: {
  branch: string;
  owner: string;
  reader: GithubRepositoryReader;
  repository: string;
  rootPackageJson: PackageJson | null;
}) => {
  const workspaceCandidatePaths = (
    await Promise.all(
      getWorkspacePatterns(rootPackageJson).map((pattern) =>
        expandWorkspacePattern({
          branch,
          owner,
          pattern,
          reader,
          repository,
        }),
      ),
    )
  ).flat();

  return uniquePaths([
    '',
    ...repositorySignalConfig.frontendProjectPaths,
    ...workspaceCandidatePaths,
  ]);
};

const getPackageJsonPath = (projectPath: string, packageJson: PackageJson | null) => {
  if (!packageJson) {
    return null;
  }

  return joinRepositoryPath(projectPath, 'package.json');
};

export const detectReportProject = async ({
  branch,
  owner,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  reader: GithubRepositoryReader;
  repository: string;
}): Promise<ReportProjectContext> => {
  const rootPackageJson = await reader.readPackageJson(owner, repository, branch);
  const candidateProjectPaths = await getCandidateProjectPaths({
    branch,
    owner,
    reader,
    repository,
    rootPackageJson,
  });

  const candidates = await Promise.all(
    candidateProjectPaths.map(async (projectPath) => ({
      packageJson:
        projectPath === ''
          ? rootPackageJson
          : await reader.readPackageJson(owner, repository, branch, projectPath),
      projectPath,
    })),
  );
  const bestCandidate = candidates.reduce(
    (best, candidate) => {
      const candidateScore = getProjectScore(candidate.projectPath, candidate.packageJson);
      const bestScore = getProjectScore(best.projectPath, best.packageJson);

      return candidateScore > bestScore ? candidate : best;
    },
    {
      packageJson: rootPackageJson,
      projectPath: '',
    },
  );

  return {
    packageJson: bestCandidate.packageJson,
    packageJsonPath: getPackageJsonPath(bestCandidate.projectPath, bestCandidate.packageJson),
    projectPath: bestCandidate.projectPath,
    rootPackageJson,
  };
};

export const resolveReportProject = async ({
  branch,
  owner,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  projectPath?: string | null;
  reader: GithubRepositoryReader;
  repository: string;
}): Promise<ReportProjectContext> => {
  if (projectPath === null || projectPath === undefined) {
    return detectReportProject({
      branch,
      owner,
      reader,
      repository,
    });
  }

  const packageJson = await reader.readPackageJson(owner, repository, branch, projectPath);

  if (projectPath && !packageJson) {
    throw new ReportProjectPathNotFoundError(projectPath);
  }

  return {
    packageJson,
    packageJsonPath: getPackageJsonPath(projectPath, packageJson),
    projectPath,
    rootPackageJson: projectPath
      ? await reader.readPackageJson(owner, repository, branch)
      : packageJson,
  };
};
