import { resolveGithubTreePath } from '@frontend-radar/github-repository';

import type { ListRepositoryBranchesApiResponse } from './reportAnalysisApi';
import type { ParsedRepositoryInput, RepositoryAnalysisRequest } from './repositoryAnalysisTypes';

export type RepositoryTreeSubmitResolveError = 'branchLoadFailed' | 'branchNotFound';

interface ResolveRepositoryTreeSubmitRequestInput {
  branchesData?: ListRepositoryBranchesApiResponse;
  isBranchManual: boolean;
  isProjectPathDisabledByUser: boolean;
  isProjectPathManual: boolean;
  loadBranchesForCurrentRepository: () => Promise<ListRepositoryBranchesApiResponse | null>;
  parsedRepository: ParsedRepositoryInput | null;
  request: RepositoryAnalysisRequest;
}

export const resolveRepositoryTreeSubmitRequest = async ({
  branchesData,
  isBranchManual,
  isProjectPathDisabledByUser,
  isProjectPathManual,
  loadBranchesForCurrentRepository,
  parsedRepository,
  request,
}: ResolveRepositoryTreeSubmitRequestInput): Promise<
  | {
      error: RepositoryTreeSubmitResolveError;
      status: 'error';
    }
  | {
      projectPathFromUrl?: string;
      request: RepositoryAnalysisRequest;
      resolvedBranch?: string;
      status: 'resolved';
    }
> => {
  if (!parsedRepository?.treePath) {
    return {
      request,
      status: 'resolved',
    };
  }

  const loadedBranches = branchesData ?? (await loadBranchesForCurrentRepository());

  if (!loadedBranches) {
    return {
      error: 'branchLoadFailed',
      status: 'error',
    };
  }

  const treeResolution = resolveGithubTreePath(
    parsedRepository.treePath,
    loadedBranches.branches.map((branch) => branch.name),
  );

  if (!treeResolution) {
    return {
      error: 'branchNotFound',
      status: 'error',
    };
  }

  const resolvedRequest: RepositoryAnalysisRequest = {
    ...request,
    branch: isBranchManual && request.branch ? request.branch : treeResolution.branch,
  };
  const shouldUseUrlProjectPath =
    treeResolution.projectPath && !isProjectPathManual && !isProjectPathDisabledByUser;

  if (shouldUseUrlProjectPath) {
    resolvedRequest.projectPath = treeResolution.projectPath;
    resolvedRequest.projectPathSource = 'url';
  }

  return {
    projectPathFromUrl: shouldUseUrlProjectPath ? treeResolution.projectPath : undefined,
    request: resolvedRequest,
    resolvedBranch: resolvedRequest.branch ?? undefined,
    status: 'resolved',
  };
};
