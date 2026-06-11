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

      if (path === '/repos/owner/repo/contents/README.md') {
        contentRefs.push(url.searchParams.get('ref'));

        return createGithubJsonResponse({
          content: encodeContent(
            [
              '# Repository',
              '## Installation',
              'Run npm install before starting development.',
              '## Usage',
              'Run npm run dev and open the local app.',
              'This README has enough contributor-facing setup detail. '.repeat(20),
            ].join('\n'),
          ),
          encoding: 'base64',
        });
      }

      if (
        [
          '/repos/owner/repo/contents/.env.example',
          '/repos/owner/repo/contents/.github/workflows',
          '/repos/owner/repo/contents/package-lock.json',
          '/repos/owner/repo/contents/tsconfig.json',
        ].includes(path)
      ) {
        contentRefs.push(url.searchParams.get('ref'));

        return createGithubJsonResponse(
          path.endsWith('/workflows')
            ? [
                {
                  name: 'ci.yml',
                  type: 'file',
                },
              ]
            : {},
        );
      }

      if (path === '/repos/owner/repo/contents/.github/workflows/ci.yml') {
        contentRefs.push(url.searchParams.get('ref'));

        return createGithubJsonResponse({
          content: encodeContent(
            [
              'on: [pull_request, push]',
              'jobs:',
              '  checks:',
              '    steps:',
              '      - uses: actions/setup-node@v4',
              '        with:',
              '          cache: npm',
              '      - run: npm ci',
              '      - run: npm run lint',
              '      - run: npm run test',
              '      - run: npm run build',
            ].join('\n'),
          ),
          encoding: 'base64',
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
      branch: 'main',
      projectPath: '',
      projectPathSource: 'autodetect',
      createdAt: new Date('2026-06-09T00:00:00.000Z'),
      latestCommitDate: '2026-06-09T00:00:00.000Z',
      latestCommitSha: 'abc123',
      latestCommitTitle: 'Add frontend dashboard',
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
        branch: 'main',
        projectDetection: {
          source: 'autodetect',
          packageJsonPath: 'package.json',
          confidence: 'medium',
          signals: expect.arrayContaining([
            expect.objectContaining({
              id: 'project-package-json',
              status: 'found',
              source: 'package.json',
            }),
          ]),
        },
        latestCommitSha: 'abc123',
        latestCommitDate: '2026-06-09T00:00:00.000Z',
        latestCommitTitle: 'Add frontend dashboard',
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
              source: 'README.md',
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
    expect(report.scoreBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'ci',
          evidence: expect.arrayContaining([
            expect.objectContaining({
              id: 'github-actions',
              source: '.github/workflows/ci.yml',
              status: 'found',
            }),
          ]),
        }),
        expect.objectContaining({
          category: 'performance',
          evidence: expect.arrayContaining([
            expect.objectContaining({
              id: 'bundler',
              source: 'package.json devDependencies.vite',
              status: 'found',
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
      branch: 'develop',
      projectPath: '',
      projectPathSource: 'autodetect',
      createdAt: new Date('2026-06-09T00:00:00.000Z'),
      latestCommitDate: null,
      latestCommitSha: null,
      latestCommitTitle: null,
    });

    expect(report.repository).toMatchObject({
      branch: 'develop',
      latestCommitSha: null,
      latestCommitDate: '2026-06-08T00:00:00.000Z',
      latestCommitTitle: null,
    });
    expect(contentRefs.length).toBeGreaterThan(0);
    expect(contentRefs.every((ref) => ref === 'develop')).toBe(true);
  });

  it('analyzes frontend signals from a nested workspace package', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = new URL(input.toString());
      const path = decodeURIComponent(url.pathname);

      if (path === '/repos/owner/repo') {
        return createGithubJsonResponse({
          default_branch: 'main',
          forks_count: 0,
          html_url: 'https://github.com/owner/repo',
          name: 'repo',
          owner: {
            login: 'owner',
          },
          pushed_at: '2026-06-08T00:00:00.000Z',
          stargazers_count: 1,
        });
      }

      if (path === '/repos/owner/repo/contents/package.json') {
        return createGithubJsonResponse({
          content: encodeContent(
            JSON.stringify({
              scripts: {
                build: 'npm run build:web',
                test: 'npm run test:web',
              },
              workspaces: ['apps/*'],
            }),
          ),
          encoding: 'base64',
        });
      }

      if (path === '/repos/owner/repo/contents/apps') {
        return createGithubJsonResponse([
          {
            name: 'api',
            path: 'apps/api',
            type: 'dir',
          },
          {
            name: 'web',
            path: 'apps/web',
            type: 'dir',
          },
        ]);
      }

      if (path === '/repos/owner/repo/contents/apps/api/package.json') {
        return createGithubJsonResponse({
          content: encodeContent(
            JSON.stringify({
              dependencies: {
                fastify: '^5.0.0',
              },
              name: '@scope/api',
            }),
          ),
          encoding: 'base64',
        });
      }

      if (path === '/repos/owner/repo/contents/apps/web/package.json') {
        return createGithubJsonResponse({
          content: encodeContent(
            JSON.stringify({
              dependencies: {
                react: '^19.0.0',
              },
              devDependencies: {
                '@testing-library/react': '^16.0.0',
                'eslint-plugin-jsx-a11y': '^6.0.0',
                typescript: '^6.0.0',
                vite: '^8.0.0',
                vitest: '^4.0.0',
              },
              name: '@scope/web',
              scripts: {
                build: 'vite build',
                lint: 'eslint .',
                test: 'vitest run',
              },
            }),
          ),
          encoding: 'base64',
        });
      }

      if (path === '/repos/owner/repo/contents/apps/web/README.md') {
        return createGithubJsonResponse({
          content: encodeContent(
            [
              '# Web App',
              '## Installation',
              'Run npm install.',
              '## Usage',
              'Run npm run dev.',
              'This README has enough project details. '.repeat(20),
            ].join('\n'),
          ),
          encoding: 'base64',
        });
      }

      if (
        [
          '/repos/owner/repo/contents/apps/web/.env.example',
          '/repos/owner/repo/contents/apps/web/tsconfig.json',
          '/repos/owner/repo/contents/package-lock.json',
        ].includes(path)
      ) {
        return createGithubJsonResponse({});
      }

      if (path === '/repos/owner/repo/contents/.github/workflows') {
        return createGithubJsonResponse([]);
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
      branch: 'main',
      projectPath: 'apps/web',
      projectPathSource: 'manual',
      createdAt: new Date('2026-06-09T00:00:00.000Z'),
      latestCommitDate: '2026-06-09T00:00:00.000Z',
      latestCommitSha: 'abc123',
      latestCommitTitle: 'Add workspace frontend',
    });

    expect(report.scoreBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'testing',
          evidence: expect.arrayContaining([
            expect.objectContaining({
              id: 'package-json',
              source: 'apps/web/package.json',
              status: 'found',
            }),
            expect.objectContaining({
              id: 'test-script',
              source: 'apps/web/package.json scripts.test',
              status: 'found',
            }),
          ]),
        }),
        expect.objectContaining({
          category: 'maintainability',
          evidence: expect.arrayContaining([
            expect.objectContaining({
              id: 'typescript',
              source: 'apps/web/tsconfig.json, apps/web/package.json devDependencies.typescript',
              status: 'found',
            }),
          ]),
        }),
        expect.objectContaining({
          category: 'performance',
          evidence: expect.arrayContaining([
            expect.objectContaining({
              id: 'bundler',
              source: 'apps/web/package.json devDependencies.vite',
              status: 'found',
            }),
          ]),
        }),
      ]),
    );
    expect(report.repository.projectDetection).toMatchObject({
      source: 'manual',
      path: 'apps/web',
      packageJsonPath: 'apps/web/package.json',
    });
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'typescript-detected',
          status: 'passed',
        }),
      ]),
    );
  });
});
