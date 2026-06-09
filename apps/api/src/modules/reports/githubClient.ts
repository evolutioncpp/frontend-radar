import { env } from '../../config/env.js';

import { createGithubErrorFromResponse, createGithubUnavailableError } from './githubErrors.js';
import { githubApiVersion, githubRequestTimeoutMs } from './reportAnalysisConfig.js';

const isAbortError = (error: unknown) => {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
};

export class GithubClient {
  async requestJson(path: string, options: { allowNotFound?: boolean } = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, githubRequestTimeoutMs);
    let response: Response;

    try {
      response = await fetch(`${env.GITHUB_API_BASE_URL}${path}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'frontend-radar-api',
          'X-GitHub-Api-Version': githubApiVersion,
          ...(env.GITHUB_TOKEN
            ? {
                Authorization: `Bearer ${env.GITHUB_TOKEN}`,
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
