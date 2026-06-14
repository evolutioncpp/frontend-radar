import { repositorySignalConfig } from '../../domain/reportAnalysisConfig.js';
import { ReportProjectPathNotFoundError } from '../../application/ports/reportAnalyzer.js';
import {
  buildProjectDetection,
  getPackageJsonPath,
  getProjectScore,
  getWorkspacePatterns,
  normalizeProjectPath,
  uniqueProjectPaths,
  type ReportProjectDetection,
} from './reportProjectDetectionHelpers.js';

import type {
  ReportRepositoryReaderContext,
  ReportRepositoryReader,
  PackageJson,
} from '../../application/ports/reportRepositoryReader.js';
import type { ReportProjectPathSource } from '../../domain/reportSchemas.js';

export interface ReportProjectContext {
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectDetection: ReportProjectDetection;
  projectPath: string;
  rootPackageJson: PackageJson | null;
}

export {
  ReportProjectPathNotFoundError,
  isReportProjectPathNotFoundError,
} from '../../application/ports/reportAnalyzer.js';

const expandWorkspacePattern = async ({
  branch,
  owner,
  pattern,
  reader,
  repository,
  context = {},
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  owner: string;
  pattern: string;
  reader: ReportRepositoryReader;
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
  const entries = await reader.listDirectoryEntries(owner, repository, branch, basePath, context);

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
  context = {},
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  owner: string;
  reader: ReportRepositoryReader;
  repository: string;
  rootPackageJson: PackageJson | null;
}) => {
  const workspaceCandidatePaths = (
    await Promise.all(
      getWorkspacePatterns(rootPackageJson).map((pattern) =>
        expandWorkspacePattern({
          branch,
          context,
          owner,
          pattern,
          reader,
          repository,
        }),
      ),
    )
  ).flat();

  return uniqueProjectPaths([
    '',
    ...repositorySignalConfig.frontendProjectPaths,
    ...workspaceCandidatePaths,
  ]);
};

export const detectReportProject = async ({
  branch,
  owner,
  reader,
  repository,
  context = {},
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  owner: string;
  reader: ReportRepositoryReader;
  repository: string;
}): Promise<ReportProjectContext> => {
  const rootPackageJson = await reader.readPackageJson(owner, repository, branch, '', context);
  const candidateProjectPaths = await getCandidateProjectPaths({
    branch,
    context,
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
          : await reader.readPackageJson(owner, repository, branch, projectPath, context),
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
    projectDetection: buildProjectDetection({
      packageJson: bestCandidate.packageJson,
      packageJsonPath: getPackageJsonPath(bestCandidate.projectPath, bestCandidate.packageJson),
      projectPath: bestCandidate.projectPath,
      rootPackageJson,
      source: 'autodetect',
    }),
    projectPath: bestCandidate.projectPath,
    rootPackageJson,
  };
};

export const resolveReportProject = async ({
  branch,
  owner,
  projectPath,
  projectPathSource,
  reader,
  repository,
  context = {},
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  owner: string;
  projectPath?: string | null;
  projectPathSource?: ReportProjectPathSource | null;
  reader: ReportRepositoryReader;
  repository: string;
}): Promise<ReportProjectContext> => {
  if (projectPath === null || projectPath === undefined) {
    return detectReportProject({
      branch,
      context,
      owner,
      reader,
      repository,
    });
  }

  const packageJson = await reader.readPackageJson(owner, repository, branch, projectPath, context);

  if (projectPath && !packageJson) {
    throw new ReportProjectPathNotFoundError(projectPath);
  }

  const packageJsonPath = getPackageJsonPath(projectPath, packageJson);
  const rootPackageJson = projectPath
    ? await reader.readPackageJson(owner, repository, branch, '', context)
    : packageJson;

  return {
    packageJson,
    packageJsonPath,
    projectDetection: buildProjectDetection({
      packageJson,
      packageJsonPath,
      projectPath,
      rootPackageJson,
      source: projectPathSource ?? (projectPath ? 'manual' : 'autodetect'),
    }),
    projectPath,
    rootPackageJson,
  };
};
