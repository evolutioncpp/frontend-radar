import { afterEach, describe, expect, it, vi } from 'vitest';

import { GithubReportAnalyzer } from './githubReportAnalyzer.js';

const createGithubJsonResponse = (body: unknown, init?: ResponseInit) => {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
    ...init,
  });
};

const encodeContent = (content: string) => Buffer.from(content, 'utf8').toString('base64');

describe('GithubReportAnalyzer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds project report from pinned GitHub API snapshot signals', async () => {
    const contentRefs: Array<string | null> = [];

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = new URL(input.toString());
      const path = decodeURIComponent(url.pathname);

      if (path === '/repos/owner/repo') {
        return createGithubJsonResponse({
          default_branch: 'main',
          description: 'Repository description',
          forks_count: 3,
          full_name: 'owner/repo',
          html_url: 'https://github.com/owner/repo',
          license: {
            spdx_id: 'MIT',
          },
          name: 'repo',
          owner: {
            login: 'owner',
          },
          pushed_at: '2026-06-08T00:00:00.000Z',
          stargazers_count: 12,
        });
      }

      if (path === '/repos/owner/repo/contents/package.json') {
        contentRefs.push(url.searchParams.get('ref'));

        return createGithubJsonResponse({
          content: encodeContent(
            JSON.stringify({
              scripts: {
                build: 'vite build',
                lint: 'eslint .',
                test: 'vitest run',
              },
              devDependencies: {
                '@testing-library/react': '^16.0.0',
                eslint: '^9.0.0',
                typescript: '^6.0.0',
                vite: '^8.0.0',
              },
            }),
          ),
          encoding: 'base64',
        });
      }

      if (
        [
          '/repos/owner/repo/contents/.env.example',
          '/repos/owner/repo/contents/.github/workflows',
          '/repos/owner/repo/contents/README.md',
          '/repos/owner/repo/contents/package-lock.json',
          '/repos/owner/repo/contents/tsconfig.json',
        ].includes(path)
      ) {
        contentRefs.push(url.searchParams.get('ref'));

        return createGithubJsonResponse(path.endsWith('/workflows') ? [{ name: 'ci.yml' }] : {});
      }

      if (path.startsWith('/repos/owner/repo/contents/')) {
        contentRefs.push(url.searchParams.get('ref'));
      }

      return createGithubJsonResponse(
        {
          message: 'Not Found',
        },
        {
          status: 404,
        },
      );
    });

    const analyzer = new GithubReportAnalyzer();
    const report = await analyzer.analyze({
      id: 'analysis-id',
      owner: 'owner',
      repository: 'repo',
      normalizedUrl: 'https://github.com/owner/repo',
      createdAt: new Date('2026-06-09T00:00:00.000Z'),
      latestCommitDate: '2026-06-09T00:00:00.000Z',
      latestCommitSha: 'abc123',
    });

    expect(report).toMatchObject({
      id: 'analysis-id',
      createdAt: '2026-06-09T00:00:00.000Z',
      repository: {
        owner: 'owner',
        name: 'repo',
        stars: 12,
        forks: 3,
        defaultBranch: 'main',
        latestCommitSha: 'abc123',
        latestCommitDate: '2026-06-09T00:00:00.000Z',
        license: 'MIT',
      },
    });
    expect(report.totalScore).toBeGreaterThan(80);
    expect(report.scoreBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'documentation',
          evidence: expect.arrayContaining([
            expect.objectContaining({
              id: 'readme',
              source: 'README',
              status: 'found',
            }),
            expect.objectContaining({
              id: 'env-example',
              source: '.env.example',
              status: 'found',
            }),
          ]),
        }),
        expect.objectContaining({
          category: 'accessibility',
          evidence: expect.arrayContaining([
            expect.objectContaining({
              id: 'a11y-tooling',
              source: 'package.json',
              status: 'missing',
            }),
          ]),
        }),
      ]),
    );
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'readme-exists',
          status: 'passed',
        }),
        expect.objectContaining({
          id: 'github-actions-exists',
          status: 'passed',
        }),
      ]),
    );
    expect(contentRefs.length).toBeGreaterThan(0);
    expect(contentRefs.every((ref) => ref === 'abc123')).toBe(true);
  });

  it('falls back to default branch ref when snapshot does not have commit sha', async () => {
    const contentRefs: Array<string | null> = [];

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = new URL(input.toString());
      const path = decodeURIComponent(url.pathname);

      if (path === '/repos/owner/repo') {
        return createGithubJsonResponse({
          default_branch: 'main',
          description: 'Repository description',
          forks_count: 3,
          html_url: 'https://github.com/owner/repo',
          name: 'repo',
          owner: {
            login: 'owner',
          },
          pushed_at: '2026-06-08T00:00:00.000Z',
          stargazers_count: 12,
        });
      }

      if (path.startsWith('/repos/owner/repo/contents/')) {
        contentRefs.push(url.searchParams.get('ref'));
      }

      return createGithubJsonResponse(
        {
          message: 'Not Found',
        },
        {
          status: 404,
        },
      );
    });

    const analyzer = new GithubReportAnalyzer();
    const report = await analyzer.analyze({
      id: 'analysis-id',
      owner: 'owner',
      repository: 'repo',
      normalizedUrl: 'https://github.com/owner/repo',
      createdAt: new Date('2026-06-09T00:00:00.000Z'),
      latestCommitDate: null,
      latestCommitSha: null,
    });

    expect(report.repository).toMatchObject({
      latestCommitSha: null,
      latestCommitDate: '2026-06-08T00:00:00.000Z',
    });
    expect(contentRefs.length).toBeGreaterThan(0);
    expect(contentRefs.every((ref) => ref === 'main')).toBe(true);
  });
});
