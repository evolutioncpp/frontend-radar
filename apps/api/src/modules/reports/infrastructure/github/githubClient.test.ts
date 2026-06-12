import { afterEach, describe, expect, it, vi } from 'vitest';

import { GithubClient } from './githubClient.js';
import { GithubRepositoryNotFoundError } from './githubErrors.js';
import { githubRequestTimeoutMs } from '../../domain/reportAnalysisConfig.js';

const createGithubResponse = (
  status: number,
  headers?: Record<string, string>,
  body: Record<string, unknown> = {
    message: 'GitHub error',
  },
) => {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    status,
  });
};

describe('GithubClient', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('maps repository not found response to repository_not_found error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(createGithubResponse(404));

    await expect(new GithubClient().requestJson('/repos/owner/missing')).rejects.toBeInstanceOf(
      GithubRepositoryNotFoundError,
    );
  });

  it('returns null for optional missing contents', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(createGithubResponse(404));

    await expect(
      new GithubClient().requestJson('/repos/owner/repo/contents/missing', {
        allowNotFound: true,
      }),
    ).resolves.toBeNull();
  });

  const errorMappingCases: Array<{
    code: string;
    headers?: Record<string, string>;
    status: number;
  }> = [
    {
      code: 'repository_forbidden',
      headers: undefined,
      status: 403,
    },
    {
      code: 'github_rate_limited',
      headers: {
        'x-ratelimit-remaining': '0',
      },
      status: 403,
    },
    {
      code: 'github_rate_limited',
      headers: {
        'retry-after': '60',
      },
      status: 403,
    },
    {
      code: 'github_rate_limited',
      headers: undefined,
      status: 429,
    },
    {
      code: 'github_unavailable',
      headers: undefined,
      status: 500,
    },
  ];

  it.each(errorMappingCases)(
    'maps $status response to $code error',
    async ({ code, headers, status }) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createGithubResponse(status, headers));

      await expect(new GithubClient().requestJson('/repos/owner/repo')).rejects.toMatchObject({
        code,
      });
    },
  );

  it('maps GitHub secondary rate limit response message to github_rate_limited error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      createGithubResponse(403, undefined, {
        message: 'You have exceeded a secondary rate limit.',
      }),
    );

    await expect(new GithubClient().requestJson('/repos/owner/repo')).rejects.toMatchObject({
      code: 'github_rate_limited',
    });
  });

  it('maps request timeout to github_unavailable error', async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const request = expect(
      new GithubClient().requestJson('/repos/owner/repo'),
    ).rejects.toMatchObject({
      code: 'github_unavailable',
    });

    await vi.advanceTimersByTimeAsync(githubRequestTimeoutMs);

    await request;
  });

  it('maps network failure to github_unavailable error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'));

    await expect(new GithubClient().requestJson('/repos/owner/repo')).rejects.toMatchObject({
      code: 'github_unavailable',
    });
  });
});
