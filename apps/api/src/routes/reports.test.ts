import { getGithubRepositoryKey } from '@frontend-radar/github-repository';
import { describe, expect, it } from 'vitest';

import { buildApp } from '../app.js';
import { GithubRepositoryNotFoundError } from '../modules/reports/githubReportAnalyzer.js';
import { InMemoryReportAnalysisRepository } from '../modules/reports/inMemoryReportAnalysisRepository.js';
import { REPORT_ANALYSIS_VERSION } from '../modules/reports/reportAnalysisConfig.js';
import { createReportAnalysisSnapshotKey } from '../modules/reports/reportAnalysisSnapshot.js';

import type { ReportAnalyzer } from '../modules/reports/githubReportAnalyzer.js';
import type { CreateReportAnalysisRecordInput } from '../modules/reports/reportAnalysisRepository.js';
import type { ProjectReport } from '../modules/reports/reportSchemas.js';

const DEFAULT_COMMIT_DATE = '2026-06-09T00:00:00.000Z';
const DEFAULT_COMMIT_SHA = 'abc123';

const createTestReport = (
  id: string,
  latestCommitDate: string | null = DEFAULT_COMMIT_DATE,
  latestCommitSha: string | null = DEFAULT_COMMIT_SHA,
): ProjectReport => ({
  id,
  createdAt: '2026-06-09T00:00:00.000Z',
  totalScore: 100,
  repository: {
    owner: 'owner',
    name: 'repo',
    url: 'https://github.com/owner/repo',
    description: 'Test repository',
    stars: 1,
    forks: 0,
    defaultBranch: 'main',
    latestCommitSha,
    latestCommitDate,
    license: 'MIT',
  },
  scoreBreakdown: [
    {
      category: 'documentation',
      label: 'Documentation',
      value: 100,
      maxValue: 100,
      status: 'excellent',
      description: 'Documentation is present.',
      evidence: [
        {
          id: 'readme',
          label: 'README',
          status: 'found',
          source: 'README',
        },
        {
          id: 'env-example',
          label: 'Environment example',
          status: 'missing',
          description: 'No environment example file was found.',
          source: '.env.example',
        },
      ],
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      label: 'README exists',
      status: 'passed',
    },
  ],
  recommendations: [],
});

const createTestRecordInput = (
  overrides: Partial<CreateReportAnalysisRecordInput> = {},
): CreateReportAnalysisRecordInput => ({
  analysisVersion: REPORT_ANALYSIS_VERSION,
  latestCommitDate: DEFAULT_COMMIT_DATE,
  latestCommitSha: DEFAULT_COMMIT_SHA,
  normalizedUrl: 'https://github.com/owner/repo',
  owner: 'owner',
  repository: 'repo',
  repositoryKey: getGithubRepositoryKey('owner', 'repo'),
  snapshotKey: createReportAnalysisSnapshotKey({
    latestCommitDate: overrides.latestCommitDate ?? DEFAULT_COMMIT_DATE,
    latestCommitSha: overrides.latestCommitSha ?? DEFAULT_COMMIT_SHA,
  }),
  ...overrides,
});

const createAnalyzer = (overrides: Partial<ReportAnalyzer> = {}): ReportAnalyzer => ({
  analyze: async (input) =>
    createTestReport(input.id, input.latestCommitDate, input.latestCommitSha),
  getRepositorySnapshot: async () => ({
    latestCommitDate: DEFAULT_COMMIT_DATE,
    latestCommitSha: DEFAULT_COMMIT_SHA,
  }),
  ...overrides,
});

const waitForQueuedWorker = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('reports routes', () => {
  it('creates report analysis job and returns queued status', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual({
        id: expect.any(String),
        reuseReason: null,
        status: 'queued',
      });
    } finally {
      await app.close();
    }
  });

  it('returns completed report after analysis finishes', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const { id } = createResponse.json<{ id: string }>();

      await waitForQueuedWorker();

      const response = await app.inject({
        method: 'GET',
        url: `/reports/${id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id,
        status: 'completed',
        report: {
          id,
          repository: {
            latestCommitSha: DEFAULT_COMMIT_SHA,
            owner: 'owner',
            name: 'repo',
          },
        },
      });
    } finally {
      await app.close();
    }
  });

  it('localizes completed report by accept-language header', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const { id } = createResponse.json<{ id: string }>();

      await waitForQueuedWorker();

      const response = await app.inject({
        headers: {
          'accept-language': 'ru-RU,ru;q=0.9,en;q=0.8',
        },
        method: 'GET',
        url: `/reports/${id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id,
        status: 'completed',
        report: {
          scoreBreakdown: [
            expect.objectContaining({
              category: 'documentation',
              evidence: expect.arrayContaining([
                expect.objectContaining({
                  id: 'env-example',
                  status: 'missing',
                  label: expect.not.stringMatching(/^Environment example$/),
                  description: expect.not.stringMatching(/^No environment example file/),
                  source: '.env.example',
                }),
              ]),
              label: 'Документация',
              description: 'Сигналы README и документации окружения, найденные в репозитории.',
            }),
          ],
          checks: [
            expect.objectContaining({
              id: 'readme-exists',
              label: 'README найден',
            }),
          ],
        },
      });
    } finally {
      await app.close();
    }
  });

  it('reuses latest completed report when repository latest commit is unchanged', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    let analyzeCallsCount = 0;
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          analyze: async (input) => {
            analyzeCallsCount += 1;

            return createTestReport(input.id, DEFAULT_COMMIT_DATE, DEFAULT_COMMIT_SHA);
          },
        }),
      },
    );

    try {
      const firstCreateResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const firstCreateBody = firstCreateResponse.json<{ id: string }>();

      await waitForQueuedWorker();

      const secondCreateResponse = await app.inject({
        headers: {
          'accept-language': 'ru',
        },
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(secondCreateResponse.statusCode).toBe(200);
      expect(secondCreateResponse.json()).toEqual({
        id: firstCreateBody.id,
        reuseReason: 'completed',
        status: 'completed',
      });
      expect(analyzeCallsCount).toBe(1);

      const response = await app.inject({
        method: 'GET',
        url: '/reports',
      });
      const body = response.json<{
        items: Array<{
          id: string;
          owner: string;
          repository: string;
          score?: number;
          status: string;
        }>;
      }>();

      expect(response.statusCode).toBe(200);
      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toMatchObject({
        id: firstCreateBody.id,
        owner: 'owner',
        repository: 'repo',
        score: 100,
        status: 'completed',
      });
    } finally {
      await app.close();
    }
  });

  it('reuses active analysis run when repository latest commit is already queued', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          analyze: async () => new Promise<ProjectReport>(() => undefined),
        }),
      },
    );

    try {
      const firstCreateResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const firstCreateBody = firstCreateResponse.json<{ id: string }>();

      const secondCreateResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(secondCreateResponse.statusCode).toBe(200);
      expect(secondCreateResponse.json()).toEqual({
        id: firstCreateBody.id,
        reuseReason: 'active',
        status: expect.stringMatching(/queued|running/),
      });
    } finally {
      await app.close();
    }
  });

  it('returns refreshed terminal status when active run completes during reuse', async () => {
    class CompletingOnTouchRepository extends InMemoryReportAnalysisRepository {
      override async touch(id: string) {
        await this.complete(id, createTestReport(id));

        const analysis = await this.findById(id);

        if (!analysis) {
          throw new Error(`Report analysis ${id} not found`);
        }

        return analysis;
      }
    }

    const repository = new CompletingOnTouchRepository();
    const queuedAnalysis = await repository.create(createTestRecordInput());
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id: queuedAnalysis.id,
        reuseReason: 'completed',
        status: 'completed',
      });
    } finally {
      await app.close();
    }
  });

  it('reuses null-sha analysis runs by snapshot key', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          analyze: async () => new Promise<ProjectReport>(() => undefined),
          getRepositorySnapshot: async () => ({
            latestCommitDate: DEFAULT_COMMIT_DATE,
            latestCommitSha: null,
          }),
        }),
      },
    );

    try {
      const firstCreateResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const firstCreateBody = firstCreateResponse.json<{ id: string }>();

      const secondCreateResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(secondCreateResponse.statusCode).toBe(200);
      expect(secondCreateResponse.json()).toEqual({
        id: firstCreateBody.id,
        reuseReason: 'active',
        status: expect.stringMatching(/queued|running/),
      });
    } finally {
      await app.close();
    }
  });

  it('creates a new analysis run when repository latest commit changed', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    let latestCommitDate = DEFAULT_COMMIT_DATE;
    let latestCommitSha = DEFAULT_COMMIT_SHA;
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          analyze: async (input) => createTestReport(input.id, latestCommitDate, latestCommitSha),
          getRepositorySnapshot: async () => ({
            latestCommitDate,
            latestCommitSha,
          }),
        }),
      },
    );

    try {
      const firstCreateResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const firstCreateBody = firstCreateResponse.json<{ id: string }>();

      await waitForQueuedWorker();

      latestCommitDate = '2026-06-10T00:00:00.000Z';
      latestCommitSha = 'def456';

      const secondCreateResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const secondCreateBody = secondCreateResponse.json<{ id: string; status: string }>();

      await waitForQueuedWorker();

      expect(secondCreateResponse.statusCode).toBe(201);
      expect(secondCreateBody.status).toBe('queued');
      expect(secondCreateBody.id).not.toBe(firstCreateBody.id);

      const response = await app.inject({
        method: 'GET',
        url: '/reports',
      });
      const body = response.json<{
        items: Array<{
          id: string;
          owner: string;
          repository: string;
          score?: number;
          status: string;
        }>;
      }>();

      expect(response.statusCode).toBe(200);
      expect(body.items).toHaveLength(2);
      expect(new Set(body.items.map((item) => item.id)).size).toBe(2);
    } finally {
      await app.close();
    }
  });

  it('retries failed analysis run for same repository snapshot', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    let shouldFail = true;
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          analyze: async (input) => {
            if (shouldFail) {
              shouldFail = false;
              throw new Error('GitHub failed');
            }

            return createTestReport(input.id);
          },
        }),
      },
    );

    try {
      const firstCreateResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const { id } = firstCreateResponse.json<{ id: string }>();

      await waitForQueuedWorker();

      const failedResponse = await app.inject({
        method: 'GET',
        url: `/reports/${id}`,
      });

      expect(failedResponse.json()).toMatchObject({
        id,
        status: 'failed',
        errorCode: 'analysis_failed',
      });

      const retryResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(retryResponse.statusCode).toBe(200);
      expect(retryResponse.json()).toEqual({
        id,
        reuseReason: 'retried',
        status: 'queued',
      });

      await waitForQueuedWorker();

      const completedResponse = await app.inject({
        method: 'GET',
        url: `/reports/${id}`,
      });

      expect(completedResponse.json()).toMatchObject({
        id,
        status: 'completed',
      });
    } finally {
      await app.close();
    }
  });

  it('returns repository not found error without creating analysis run', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          getRepositorySnapshot: async () => {
            throw new GithubRepositoryNotFoundError();
          },
        }),
      },
    );

    try {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'missing-repo',
          normalizedUrl: 'https://github.com/owner/missing-repo',
        },
      });

      expect(createResponse.statusCode).toBe(404);
      expect(createResponse.json()).toEqual({
        code: 'repository_not_found',
        message: 'GitHub repository not found',
      });

      const historyResponse = await app.inject({
        method: 'GET',
        url: '/reports',
      });

      expect(historyResponse.json()).toEqual({
        items: [],
      });
    } finally {
      await app.close();
    }
  });

  it('localizes repository not found submit error', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          getRepositorySnapshot: async () => {
            throw new GithubRepositoryNotFoundError();
          },
        }),
      },
    );

    try {
      const createResponse = await app.inject({
        headers: {
          'accept-language': 'ru',
        },
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'missing-repo',
          normalizedUrl: 'https://github.com/owner/missing-repo',
        },
      });

      expect(createResponse.statusCode).toBe(404);
      expect(createResponse.json()).toEqual({
        code: 'repository_not_found',
        message: 'Репозиторий GitHub не найден.',
      });
    } finally {
      await app.close();
    }
  });

  it('stores failed analysis and hides it from history', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          analyze: async () => {
            throw new Error('GitHub failed');
          },
        }),
      },
    );

    try {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const { id } = createResponse.json<{ id: string }>();

      await waitForQueuedWorker();

      const response = await app.inject({
        headers: {
          'accept-language': 'ru',
        },
        method: 'GET',
        url: `/reports/${id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id,
        status: 'failed',
        errorCode: 'analysis_failed',
        errorMessage: 'Не удалось проанализировать репозиторий.',
      });

      const historyResponse = await app.inject({
        method: 'GET',
        url: '/reports',
      });

      expect(historyResponse.json()).toEqual({
        items: [],
      });
    } finally {
      await app.close();
    }
  });

  it('recovers queued analysis runs on app startup', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const queuedAnalysis = await repository.create(createTestRecordInput());
    const app = buildApp(
      {},
      {
        recoverOnStart: true,
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      await app.ready();
      await waitForQueuedWorker();

      const response = await app.inject({
        method: 'GET',
        url: `/reports/${queuedAnalysis.id}`,
      });

      expect(response.json()).toMatchObject({
        id: queuedAnalysis.id,
        status: 'completed',
      });
    } finally {
      await app.close();
    }
  });
});
