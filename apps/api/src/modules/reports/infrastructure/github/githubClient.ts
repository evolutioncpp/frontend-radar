import { env } from '../../../../config/env.js';

import { createGithubErrorFromResponse, createGithubUnavailableError } from './githubErrors.js';
import { githubApiVersion, githubRequestTimeoutMs } from '../../domain/reportAnalysisConfig.js';

export interface GithubRequestOptions {
  allowNotFound?: boolean;
  githubToken?: string;
}

const isAbortError = (error: unknown) => {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
};

export class GithubClient {
  async requestJson(path: string, options: GithubRequestOptions = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, githubRequestTimeoutMs);
    let response: Response;
    const authorizationToken = options.githubToken?.trim() || env.GITHUB_TOKEN;

    try {
      response = await fetch(`${env.GITHUB_API_BASE_URL}${path}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'frontend-radar-api',
          'X-GitHub-Api-Version': githubApiVersion,
          ...(authorizationToken
            ? {
                Authorization: `Bearer ${authorizationToken}`,
              }
            : {}),
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw createGithubUnavailableError('GitHub API request timed out');
      }

      throw createGithubUnavailableError('GitHub API request failed');
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 404 && options.allowNotFound) {
      return null;
    }

    if (!response.ok) {
      throw await createGithubErrorFromResponse(response);
    }

    return response.json() as Promise<unknown>;
  }
}
