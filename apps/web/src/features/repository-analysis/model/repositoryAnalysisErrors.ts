import {
  getApiErrorCode,
  getApiErrorStatus,
  isApiTransportErrorStatus,
} from '@/shared/api/apiErrors';

export type RepositoryAnalysisSubmitError =
  | 'repositoryNotFound'
  | 'branchNotFound'
  | 'repositoryForbidden'
  | 'githubRateLimited'
  | 'githubUnavailable'
  | 'serviceUnavailable'
  | 'projectPathNotFound'
  | 'repositoryVerificationFailed'
  | 'unknown'
  | null;

export const getRepositoryAnalysisSubmitError = (error: unknown): RepositoryAnalysisSubmitError => {
  const errorCode = getApiErrorCode(error);

  if (errorCode === 'repository_not_found') {
    return 'repositoryNotFound';
  }

  if (errorCode === 'branch_not_found') {
    return 'branchNotFound';
  }

  if (errorCode === 'repository_forbidden') {
    return 'repositoryForbidden';
  }

  if (errorCode === 'github_rate_limited') {
    return 'githubRateLimited';
  }

  if (errorCode === 'github_unavailable') {
    return 'githubUnavailable';
  }

  if (errorCode === 'project_path_not_found') {
    return 'projectPathNotFound';
  }

  if (errorCode === 'repository_verification_failed') {
    return 'repositoryVerificationFailed';
  }

  const status = getApiErrorStatus(error);

  if (status === 404) {
    return 'repositoryNotFound';
  }

  if (status === 403) {
    return 'repositoryForbidden';
  }

  if (status === 429) {
    return 'githubRateLimited';
  }

  if (status === 422) {
    return 'projectPathNotFound';
  }

  if (status === 500 || status === 503 || isApiTransportErrorStatus(status)) {
    return 'serviceUnavailable';
  }

  if (status === 502) {
    return 'repositoryVerificationFailed';
  }

  return 'unknown';
};
