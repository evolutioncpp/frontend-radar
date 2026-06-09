import type { ReportAnalysisErrorCode } from './reportSchemas.js';

export class GithubApiError extends Error {
  constructor(
    message: string,
    readonly code: ReportAnalysisErrorCode,
    readonly userMessage: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'GithubApiError';
  }
}

export class GithubRepositoryNotFoundError extends GithubApiError {
  constructor() {
    super(
      'GitHub repository was not found',
      'repository_not_found',
      'GitHub repository not found',
      404,
    );
    this.name = 'GithubRepositoryNotFoundError';
  }
}

export const isGithubApiError = (error: unknown): error is GithubApiError => {
  return error instanceof GithubApiError;
};

export const isGithubRepositoryNotFoundError = (
  error: unknown,
): error is GithubRepositoryNotFoundError => {
  return error instanceof GithubRepositoryNotFoundError;
};

const githubRateLimitMessagePatterns = ['rate limit', 'secondary rate limit', 'abuse detection'];

const isGithubRateLimitResponse = (response: Response, body: unknown) => {
  const remaining = response.headers.get('x-ratelimit-remaining');
  const retryAfter = response.headers.get('retry-after');

  if (remaining === '0' || retryAfter) {
    return true;
  }

  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return false;
  }

  const message = (body as { message?: unknown }).message;

  if (typeof message !== 'string') {
    return false;
  }

  return githubRateLimitMessagePatterns.some((pattern) => message.toLowerCase().includes(pattern));
};

export const createGithubErrorFromResponse = async (response: Response) => {
  if (response.status === 404) {
    return new GithubRepositoryNotFoundError();
  }

  if (response.status === 403) {
    let body: unknown = null;

    try {
      body = await response.clone().json();
    } catch {
      body = null;
    }

    if (isGithubRateLimitResponse(response, body)) {
      return new GithubApiError(
        'GitHub API rate limit exceeded',
        'github_rate_limited',
        'GitHub API rate limit exceeded. Try again later.',
        response.status,
      );
    }

    return new GithubApiError(
      'GitHub repository is forbidden',
      'repository_forbidden',
      'GitHub repository is private or access is forbidden.',
      response.status,
    );
  }

  if (response.status === 429) {
    return new GithubApiError(
      'GitHub API rate limit exceeded',
      'github_rate_limited',
      'GitHub API rate limit exceeded. Try again later.',
      response.status,
    );
  }

  if (response.status >= 500) {
    return new GithubApiError(
      `GitHub API request failed with status ${response.status}`,
      'github_unavailable',
      'GitHub is unavailable right now. Try again later.',
      response.status,
    );
  }

  return new GithubApiError(
    `GitHub API request failed with status ${response.status}`,
    'repository_verification_failed',
    'GitHub repository could not be verified.',
    response.status,
  );
};

export const createGithubUnavailableError = (message: string) => {
  return new GithubApiError(
    message,
    'github_unavailable',
    'GitHub is unavailable right now. Try again later.',
  );
};

export const getReportAnalysisFailure = (error: unknown) => {
  if (isGithubApiError(error)) {
    return {
      errorCode: error.code,
      errorMessage: error.userMessage,
    };
  }

  return {
    errorCode: 'analysis_failed' as const,
    errorMessage: 'Repository analysis failed.',
  };
};
