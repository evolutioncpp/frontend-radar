import {
  getApiErrorCode,
  getApiErrorStatus,
  isApiTransportErrorStatus,
} from '@/shared/api/apiErrors';

export type GithubTokenValidationError =
  | 'forbidden'
  | 'missing'
  | 'rateLimited'
  | 'unavailable'
  | 'unknown';

export const getGithubTokenValidationError = (error: unknown): GithubTokenValidationError => {
  const errorCode = getApiErrorCode(error);

  if (errorCode === 'repository_forbidden') {
    return 'forbidden';
  }

  if (errorCode === 'github_rate_limited') {
    return 'rateLimited';
  }

  if (errorCode === 'github_unavailable') {
    return 'unavailable';
  }

  const status = getApiErrorStatus(error);

  if (status === 403 || status === 401) {
    return 'forbidden';
  }

  if (status === 429) {
    return 'rateLimited';
  }

  if (status === 500 || status === 502 || status === 503 || isApiTransportErrorStatus(status)) {
    return 'unavailable';
  }

  return 'unknown';
};
