import { getGithubRepositoryKey } from '@frontend-radar/github-repository';
import { describe, expect, it, vi } from 'vitest';

import { buildApp } from '../app.js';
import {
  GithubApiError,
  GithubBranchNotFoundError,
  GithubRepositoryNotFoundError,
} from '../modules/reports/analysis/githubReportAnalyzer.js';
import { InMemoryReportAnalysisRepository } from '../modules/reports/infrastructure/persistence/inMemoryReportAnalysisRepository.js';
import { REPORT_ANALYSIS_VERSION } from '../modules/reports/domain/reportAnalysisConfig.js';
import { createReportAnalysisSnapshotKey } from '../modules/reports/domain/reportAnalysisSnapshot.js';
import { startReportAnalysis } from '../modules/reports/application/reportAnalysisWorker.js';
import { ReportProjectPathNotFoundError } from '../modules/reports/analysis/project-detector/reportProjectDetector.js';

import type { ReportAnalyzer } from '../modules/reports/analysis/githubReportAnalyzer.js';
import type {
  CreateReportAnalysisRecordInput,
  ReportAnalysisFailure,
} from '../modules/reports/infrastructure/persistence/reportAnalysisRepository.js';
import type { ProjectReport } from '../modules/reports/domain/reportSchemas.js';

const DEFAULT_COMMIT_DATE = '2026-06-09T00:00:00.000Z';
const DEFAULT_COMMIT_SHA = 'abc123';
const DEFAULT_COMMIT_TITLE = 'Initial frontend quality pass';
const DEFAULT_BRANCH = 'main';

const emptyTooling: ProjectReport['tooling'] = {
  accessibility: [],
  bundlers: [],
  formatting: [],
  frameworks: [],
  linting: [],
  packageManager: [],
  testing: [],
  typing: [],
  uiReview: [],
};

const createScoreDetails = (
  value: number,
): ProjectReport['scoreBreakdown'][number]['scoreDetails'] => ({
  rawValue: value,
  finalValue: value,
  weight: 1,
  impactLevel: 'supporting',
  checks: [],
});

const createTestReport = (
  id: string,
  latestCommitDate: string | null = DEFAULT_COMMIT_DATE,
  latestCommitSha: string | null = DEFAULT_COMMIT_SHA,
  projectPath: string | null = null,
  latestCommitTitle: string | null = DEFAULT_COMMIT_TITLE,
  branch = DEFAULT_BRANCH,
): ProjectReport => ({
  analysisSources: [],
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
    defaultBranch: DEFAULT_BRANCH,
    branch,
    projectPath,
    projectDetection: {
      source: projectPath ? 'manual' : 'autodetect',
      path: projectPath,
      packageJsonPath: projectPath ? `${projectPath}/package.json` : 'package.json',
      confidence: 'high',
      signals: [
        {
          id: 'project-package-json',
          label: 'Frontend package.json',
          status: 'found',
          source: projectPath ? `${projectPath}/package.json` : 'package.json',
        },
      ],
    },
    latestCommitSha,
    latestCommitDate,
    latestCommitTitle,
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
      scoreDetails: createScoreDetails(100),
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      label: 'README exists',
      status: 'passed',
    },
  ],
  tooling: emptyTooling,
  recommendations: [],
});

const createTestRecordInput = (
  overrides: Partial<CreateReportAnalysisRecordInput> = {},
): CreateReportAnalysisRecordInput => ({
  analysisVersion: REPORT_ANALYSIS_VERSION,
  branch: DEFAULT_BRANCH,
  latestCommitDate: DEFAULT_COMMIT_DATE,
  latestCommitSha: DEFAULT_COMMIT_SHA,
  latestCommitTitle: DEFAULT_COMMIT_TITLE,
  normalizedUrl: 'https://github.com/owner/repo',
  owner: 'owner',
  projectPath: '',
  projectPathSource: 'autodetect',
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
    createTestReport(
      input.id,
      input.latestCommitDate,
      input.latestCommitSha,
      input.projectPath || null,
      input.latestCommitTitle,
      input.branch,
    ),
  getRepositorySnapshot: async () => ({
    branch: DEFAULT_BRANCH,
    defaultBranch: DEFAULT_BRANCH,
    latestCommitDate: DEFAULT_COMMIT_DATE,
    latestCommitSha: DEFAULT_COMMIT_SHA,
    latestCommitTitle: DEFAULT_COMMIT_TITLE,
  }),
  listRepositoryBranches: async () => ({
    defaultBranch: DEFAULT_BRANCH,
    branches: [
      {
        isDefault: true,
        name: DEFAULT_BRANCH,
      },
    ],
    isTruncated: false,
  }),
  resolveProjectPath: async (_owner, _repository, _ref, projectPath) => projectPath ?? '',
  ...overrides,
});

const createAnalyzerWithScoreDetails = (): ReportAnalyzer =>
  createAnalyzer({
    analyze: async (input) => {
      const report = createTestReport(
        input.id,
        input.latestCommitDate,
        input.latestCommitSha,
        input.projectPath || null,
        input.latestCommitTitle,
        input.branch,
      );
      const documentationMetric = report.scoreBreakdown[0];

      if (documentationMetric) {
        documentationMetric.scoreDetails = {
          rawValue: 50,
          finalValue: 50,
          weight: 10,
          impactLevel: 'supporting',
          checks: [
            {
              confidence: 'high',
              description: 'No environment example file was found.',
              earned: 0,
              id: 'env-example',
              label: 'Environment example',
              max: 20,
              scope: 'repository',
              severity: 'minor',
              source: '.env.example',
              status: 'failed',
            },
          ],
        };
      }

      return report;
    },
  });

const waitForQueuedWorker = () => new Promise((resolve) => setTimeout(resolve, 0));

const waitForClockTick = () => new Promise((resolve) => setTimeout(resolve, 1));

const claimAnalysisForTest = async (
  repository: InMemoryReportAnalysisRepository,
  analysisId: string,
  leaseOwner = `test-${analysisId}`,
) => {
  const claimedAnalysis = await repository.claimForProcessing({
    id: analysisId,
    leaseExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    leaseOwner,
    now: new Date(),
  });

  if (!claimedAnalysis) {
    throw new Error(`Report analysis ${analysisId} was not claimed`);
  }

  return {
    analysis: claimedAnalysis,
    leaseOwner,
  };
};

const completeAnalysisForTest = async (
  repository: InMemoryReportAnalysisRepository,
  analysisId: string,
  report: ProjectReport = createTestReport(analysisId),
) => {
  const { leaseOwner } = await claimAnalysisForTest(repository, analysisId);

  return repository.complete(analysisId, report, { leaseOwner });
};

const failAnalysisForTest = async (
  repository: InMemoryReportAnalysisRepository,
  analysisId: string,
  failure: ReportAnalysisFailure = {
    errorCode: 'analysis_failed',
    errorMessage: 'Failed',
  },
) => {
  const { leaseOwner } = await claimAnalysisForTest(repository, analysisId);

  return repository.fail(analysisId, failure, { leaseOwner });
};

describe('reports routes', () => {
  it('lists repository branches for branch selector', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          listRepositoryBranches: async () => ({
            defaultBranch: 'main',
            branches: [
              {
                isDefault: true,
                name: 'main',
              },
              {
                isDefault: false,
                name: 'feature/dashboard',
              },
            ],
            isTruncated: false,
          }),
        }),
      },
    );

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/repositories/owner/repo/branches',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        defaultBranch: 'main',
        branches: [
          {
            isDefault: true,
            name: 'main',
          },
          {
            isDefault: false,
            name: 'feature/dashboard',
          },
        ],
        isTruncated: false,
      });
    } finally {
      await app.close();
    }
  });

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

  it('creates report analysis job for explicit project path', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const startedAnalyses: Array<{ projectPath: string; projectPathSource: string }> = [];
    const resolveProjectPath = vi.fn(async () => 'apps/web');
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          resolveProjectPath,
        }),
        startReportAnalysis: (analysis) => {
          startedAnalyses.push({
            projectPath: analysis.projectPath,
            projectPathSource: analysis.projectPathSource,
          });
        },
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          projectPath: 'apps/web',
          projectPathSource: 'url',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(resolveProjectPath).toHaveBeenCalledWith(
        'owner',
        'repo',
        DEFAULT_COMMIT_SHA,
        'apps/web',
        'url',
      );
      expect(startedAnalyses).toEqual([
        {
          projectPath: 'apps/web',
          projectPathSource: 'url',
        },
      ]);
    } finally {
      await app.close();
    }
  });

  it('creates separate analyses for the same commit and different project paths', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          resolveProjectPath: async (_owner, _repository, _ref, projectPath) => projectPath ?? '',
        }),
        startReportAnalysis: () => undefined,
      },
    );

    try {
      const firstResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          projectPath: 'apps/web',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const secondResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          projectPath: 'apps/admin',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(firstResponse.statusCode).toBe(201);
      expect(secondResponse.statusCode).toBe(201);
      expect(firstResponse.json<{ id: string }>().id).not.toBe(
        secondResponse.json<{ id: string }>().id,
      );
      await expect(repository.findLatest(10)).resolves.toHaveLength(2);
    } finally {
      await app.close();
    }
  });

  it('creates separate analyses for the same commit and different branches', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          getRepositorySnapshot: async (_owner, _repository, branch) => ({
            branch: branch ?? DEFAULT_BRANCH,
            defaultBranch: DEFAULT_BRANCH,
            latestCommitDate: DEFAULT_COMMIT_DATE,
            latestCommitSha: DEFAULT_COMMIT_SHA,
            latestCommitTitle: DEFAULT_COMMIT_TITLE,
          }),
        }),
        startReportAnalysis: () => undefined,
      },
    );

    try {
      const firstResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          branch: 'main',
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });
      const secondResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          branch: 'feature/dashboard',
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(firstResponse.statusCode).toBe(201);
      expect(secondResponse.statusCode).toBe(201);
      expect(firstResponse.json<{ id: string }>().id).not.toBe(
        secondResponse.json<{ id: string }>().id,
      );
      await expect(repository.findLatest(10)).resolves.toHaveLength(2);
    } finally {
      await app.close();
    }
  });

  it('returns validation error when explicit project path has no package.json', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          resolveProjectPath: async () => {
            throw new ReportProjectPathNotFoundError('apps/missing');
          },
        }),
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          owner: 'owner',
          projectPath: 'apps/missing',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({
        code: 'project_path_not_found',
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
            latestCommitTitle: DEFAULT_COMMIT_TITLE,
            owner: 'owner',
            name: 'repo',
          },
        },
      });
    } finally {
      await app.close();
    }
  });

  it.each(['queued', 'running'] as const)(
    'returns processing summary for %s report analysis',
    async (status) => {
      const repository = new InMemoryReportAnalysisRepository();
      const app = buildApp(
        {},
        {
          reportAnalysisRepository: repository,
          reportAnalyzer: createAnalyzer(),
          startReportAnalysis: () => undefined,
        },
      );
      const analysis = await repository.create(
        createTestRecordInput({
          branch: 'feature/dashboard',
          projectPath: 'apps/web',
        }),
      );

      if (status === 'running') {
        await claimAnalysisForTest(repository, analysis.id);
      }

      try {
        const response = await app.inject({
          method: 'GET',
          url: `/reports/${analysis.id}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchObject({
          id: analysis.id,
          status,
          analysis: {
            owner: 'owner',
            repository: 'repo',
            normalizedUrl: 'https://github.com/owner/repo',
            branch: 'feature/dashboard',
            projectPath: 'apps/web',
            latestCommitDate: DEFAULT_COMMIT_DATE,
            latestCommitSha: DEFAULT_COMMIT_SHA,
            latestCommitTitle: DEFAULT_COMMIT_TITLE,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        });
      } finally {
        await app.close();
      }
    },
  );

  it('localizes completed report by accept-language header', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzerWithScoreDetails(),
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
              scoreDetails: expect.objectContaining({
                checks: expect.arrayContaining([
                  expect.objectContaining({
                    id: 'env-example',
                    status: 'failed',
                    label: expect.not.stringMatching(/^Environment example$/),
                    description: expect.not.stringMatching(/^No environment example file/),
                    source: '.env.example',
                  }),
                ]),
              }),
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
        latestCommitTitle: DEFAULT_COMMIT_TITLE,
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
        await completeAnalysisForTest(this, id, createTestReport(id));

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
            branch: DEFAULT_BRANCH,
            latestCommitDate: DEFAULT_COMMIT_DATE,
            latestCommitSha: null,
            latestCommitTitle: DEFAULT_COMMIT_TITLE,
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
          analyze: async (input) =>
            createTestReport(
              input.id,
              latestCommitDate,
              latestCommitSha,
              null,
              input.latestCommitTitle,
            ),
          getRepositorySnapshot: async () => ({
            branch: DEFAULT_BRANCH,
            latestCommitDate,
            latestCommitSha,
            latestCommitTitle: DEFAULT_COMMIT_TITLE,
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

  it('retries failed report analysis by id', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const failedAnalysis = await repository.create(createTestRecordInput());

    await failAnalysisForTest(repository, failedAnalysis.id, {
      errorCode: 'github_unavailable',
      errorMessage: 'GitHub is unavailable right now.',
    });

    const startedAnalyses: string[] = [];
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
        startReportAnalysis: (analysis) => {
          startedAnalyses.push(analysis.id);
        },
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: `/reports/${failedAnalysis.id}/retry`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id: failedAnalysis.id,
        retryReason: 'retried',
        status: 'queued',
      });
      expect(startedAnalyses).toEqual([failedAnalysis.id]);

      const retriedAnalysis = await repository.findById(failedAnalysis.id);

      expect(retriedAnalysis).toMatchObject({
        errorCode: null,
        errorMessage: null,
        status: 'queued',
      });
    } finally {
      await app.close();
    }
  });

  it('returns active retry status without restarting active report analysis', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const runningAnalysis = await repository.create(createTestRecordInput());

    await claimAnalysisForTest(repository, runningAnalysis.id);

    const startReportAnalysis = vi.fn();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
        startReportAnalysis,
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: `/reports/${runningAnalysis.id}/retry`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id: runningAnalysis.id,
        retryReason: 'active',
        status: 'running',
      });
      expect(startReportAnalysis).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it('returns not found when retry target does not exist', async () => {
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
        url: '/reports/missing-id/retry',
      });

      expect(response.statusCode).toBe(404);
    } finally {
      await app.close();
    }
  });

  it('keeps current completed report when force refresh snapshot is unchanged', async () => {
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

      const beforeRefresh = await repository.findById(id);
      const refreshResponse = await app.inject({
        method: 'POST',
        url: `/reports/${id}/refresh`,
      });
      const afterRefresh = await repository.findById(id);

      expect(refreshResponse.statusCode).toBe(200);
      expect(refreshResponse.json()).toEqual({
        id,
        refreshReason: 'up_to_date',
        status: 'completed',
      });
      expect(afterRefresh?.updatedAt).toEqual(beforeRefresh?.updatedAt);

      const historyResponse = await app.inject({
        method: 'GET',
        url: '/reports',
      });

      expect(historyResponse.json<{ items: unknown[] }>().items).toHaveLength(1);
    } finally {
      await app.close();
    }
  });

  it('creates a new queued analysis when force refresh finds a changed snapshot', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    let latestCommitDate = DEFAULT_COMMIT_DATE;
    let latestCommitSha = DEFAULT_COMMIT_SHA;
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          analyze: async (input) =>
            createTestReport(
              input.id,
              input.latestCommitDate,
              input.latestCommitSha,
              null,
              input.latestCommitTitle,
            ),
          getRepositorySnapshot: async () => ({
            branch: DEFAULT_BRANCH,
            latestCommitDate,
            latestCommitSha,
            latestCommitTitle: DEFAULT_COMMIT_TITLE,
          }),
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

      latestCommitDate = '2026-06-10T00:00:00.000Z';
      latestCommitSha = 'def456';

      const refreshResponse = await app.inject({
        method: 'POST',
        url: `/reports/${id}/refresh`,
      });
      const body = refreshResponse.json<{ id: string; refreshReason: string; status: string }>();

      expect(refreshResponse.statusCode).toBe(201);
      expect(body).toEqual({
        id: expect.any(String),
        refreshReason: 'created',
        status: 'queued',
      });
      expect(body.id).not.toBe(id);

      const newAnalysis = await repository.findById(body.id);

      expect(newAnalysis).toMatchObject({
        latestCommitDate,
        latestCommitSha,
        latestCommitTitle: DEFAULT_COMMIT_TITLE,
        snapshotKey: createReportAnalysisSnapshotKey({
          latestCommitDate,
          latestCommitSha,
        }),
      });
    } finally {
      await app.close();
    }
  });

  it('keeps autodetected project path source when force refresh creates a new run', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const currentAnalysis = await repository.create(
      createTestRecordInput({
        projectPath: 'apps/web',
        projectPathSource: 'autodetect',
      }),
    );

    await completeAnalysisForTest(
      repository,
      currentAnalysis.id,
      createTestReport(
        currentAnalysis.id,
        currentAnalysis.latestCommitDate,
        currentAnalysis.latestCommitSha,
        'apps/web',
      ),
    );

    const latestCommitDate = '2026-06-10T00:00:00.000Z';
    const latestCommitSha = 'def456';
    const resolveProjectPath = vi.fn(async () => 'apps/web');
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          getRepositorySnapshot: async () => ({
            branch: DEFAULT_BRANCH,
            defaultBranch: 'main',
            latestCommitDate,
            latestCommitSha,
            latestCommitTitle: DEFAULT_COMMIT_TITLE,
          }),
          resolveProjectPath,
        }),
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: `/reports/${currentAnalysis.id}/refresh`,
      });
      const body = response.json<{ id: string; refreshReason: string; status: string }>();

      expect(response.statusCode).toBe(201);
      expect(resolveProjectPath).toHaveBeenCalledWith(
        'owner',
        'repo',
        latestCommitSha,
        'apps/web',
        'autodetect',
      );

      const newAnalysis = await repository.findById(body.id);

      expect(newAnalysis).toMatchObject({
        projectPath: 'apps/web',
        projectPathSource: 'autodetect',
      });
    } finally {
      await app.close();
    }
  });

  it('reuses active analysis when force refresh changed snapshot is already queued', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const currentAnalysis = await repository.create(createTestRecordInput());

    await completeAnalysisForTest(
      repository,
      currentAnalysis.id,
      createTestReport(currentAnalysis.id),
    );

    const latestCommitDate = '2026-06-10T00:00:00.000Z';
    const latestCommitSha = 'def456';
    const queuedAnalysis = await repository.create(
      createTestRecordInput({
        latestCommitDate,
        latestCommitSha,
        snapshotKey: createReportAnalysisSnapshotKey({
          latestCommitDate,
          latestCommitSha,
        }),
      }),
    );
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          getRepositorySnapshot: async () => ({
            branch: DEFAULT_BRANCH,
            latestCommitDate,
            latestCommitSha,
            latestCommitTitle: DEFAULT_COMMIT_TITLE,
          }),
        }),
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: `/reports/${currentAnalysis.id}/refresh`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id: queuedAnalysis.id,
        refreshReason: 'reused',
        status: expect.stringMatching(/queued|running/),
      });
    } finally {
      await app.close();
    }
  });

  it('returns conflict when force refresh target is not completed', async () => {
    const repository = new InMemoryReportAnalysisRepository();
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
        url: `/reports/${queuedAnalysis.id}/refresh`,
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toEqual({
        message: 'Only completed reports can be refreshed.',
      });
    } finally {
      await app.close();
    }
  });

  it('returns not found when force refresh target does not exist', async () => {
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
        url: '/reports/missing-id/refresh',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        message: 'Report analysis not found',
      });
    } finally {
      await app.close();
    }
  });

  it('maps GitHub errors during force refresh snapshot verification', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const currentAnalysis = await repository.create(createTestRecordInput());

    await completeAnalysisForTest(
      repository,
      currentAnalysis.id,
      createTestReport(currentAnalysis.id),
    );

    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          getRepositorySnapshot: async () => {
            throw new GithubApiError(
              'GitHub API rate limit exceeded',
              'github_rate_limited',
              'GitHub API rate limit exceeded. Try again later.',
              429,
            );
          },
        }),
      },
    );

    try {
      const response = await app.inject({
        method: 'POST',
        url: `/reports/${currentAnalysis.id}/refresh`,
      });

      expect(response.statusCode).toBe(429);
      expect(response.json()).toEqual({
        code: 'github_rate_limited',
        message: 'GitHub API rate limit exceeded. Try again later.',
      });
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

  it('returns branch not found error without creating analysis run', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer({
          getRepositorySnapshot: async () => {
            throw new GithubBranchNotFoundError('missing-branch');
          },
        }),
      },
    );

    try {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/reports/analyze',
        payload: {
          branch: 'missing-branch',
          owner: 'owner',
          repository: 'repo',
          normalizedUrl: 'https://github.com/owner/repo',
        },
      });

      expect(createResponse.statusCode).toBe(422);
      expect(createResponse.json()).toEqual({
        code: 'branch_not_found',
        message: 'GitHub branch not found.',
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

  it('returns unavailable comparison when there is no previous completed report', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const currentAnalysis = await repository.create(createTestRecordInput());

    await completeAnalysisForTest(
      repository,
      currentAnalysis.id,
      createTestReport(currentAnalysis.id),
    );

    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/reports/${currentAnalysis.id}/comparison`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        status: 'unavailable',
      });
    } finally {
      await app.close();
    }
  });

  it('returns comparison between current and previous completed reports', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const createComparisonReport = (
      id: string,
      options: {
        checkStatus: ProjectReport['checks'][number]['status'];
        recommendations: ProjectReport['recommendations'];
        score: number;
      },
    ): ProjectReport => ({
      ...createTestReport(id),
      totalScore: options.score,
      scoreBreakdown: [
        {
          category: 'documentation',
          label: 'Documentation',
          value: options.score,
          maxValue: 100,
          status: options.score >= 75 ? 'good' : 'warning',
          description: 'Documentation signals.',
          scoreDetails: createScoreDetails(options.score),
        },
      ],
      checks: [
        {
          id: 'readme-exists',
          label: 'README exists',
          status: options.checkStatus,
        },
      ],
      recommendations: options.recommendations,
    });
    const previousAnalysis = await repository.create(
      createTestRecordInput({
        latestCommitDate: '2026-06-08T00:00:00.000Z',
        latestCommitSha: 'previous-sha',
      }),
    );

    await completeAnalysisForTest(
      repository,
      previousAnalysis.id,
      createComparisonReport(previousAnalysis.id, {
        checkStatus: 'failed',
        recommendations: [
          {
            id: 'add-test-script',
            severity: 'high',
            title: 'Add an automated test script',
            description: 'Expose a test script.',
          },
          {
            id: 'add-a11y-tooling',
            severity: 'medium',
            title: 'Add accessibility checks',
            description: 'Add accessibility tooling.',
          },
        ],
        score: 60,
      }),
    );

    await waitForClockTick();

    const currentAnalysis = await repository.create(
      createTestRecordInput({
        latestCommitDate: '2026-06-09T00:00:00.000Z',
        latestCommitSha: 'current-sha',
      }),
    );

    await completeAnalysisForTest(
      repository,
      currentAnalysis.id,
      createComparisonReport(currentAnalysis.id, {
        checkStatus: 'passed',
        recommendations: [
          {
            id: 'add-a11y-tooling',
            severity: 'medium',
            title: 'Add accessibility checks',
            description: 'Add accessibility tooling.',
          },
          {
            id: 'add-env-example',
            severity: 'low',
            title: 'Document environment variables',
            description: 'Add an .env.example file.',
          },
        ],
        score: 90,
      }),
    );

    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      const response = await app.inject({
        headers: {
          'accept-language': 'ru',
        },
        method: 'GET',
        url: `/reports/${currentAnalysis.id}/comparison`,
      });
      const body = response.json<{
        status: string;
        currentReportId: string;
        previousReportId: string;
        totalScore: { current: number; previous: number; delta: number };
        metrics: Array<{ category: string; delta: number; label: string }>;
        checks: Array<{ id: string; previousStatus: string; currentStatus: string; label: string }>;
        recommendations: {
          added: Array<{ id: string; title: string }>;
          resolved: Array<{ id: string; title: string }>;
          persistentCount: number;
        };
      }>();

      expect(response.statusCode).toBe(200);
      expect(body).toMatchObject({
        status: 'available',
        currentReportId: currentAnalysis.id,
        previousReportId: previousAnalysis.id,
        totalScore: {
          current: 90,
          previous: 60,
          delta: 30,
        },
        metrics: [
          expect.objectContaining({
            category: 'documentation',
            delta: 30,
            label: expect.not.stringMatching(/^Documentation$/),
          }),
        ],
        checks: [
          {
            id: 'readme-exists',
            previousStatus: 'failed',
            currentStatus: 'passed',
            label: expect.not.stringMatching(/^README exists$/),
          },
        ],
        recommendations: {
          added: [
            expect.objectContaining({
              id: 'add-env-example',
              title: expect.not.stringMatching(/^Document environment variables$/),
            }),
          ],
          resolved: [
            expect.objectContaining({
              id: 'add-test-script',
              title: expect.not.stringMatching(/^Add an automated test script$/),
            }),
          ],
          persistentCount: 1,
        },
      });
    } finally {
      await app.close();
    }
  });

  it('returns comparison against explicit previous completed report', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const createScoredReport = (id: string, score: number): ProjectReport => {
      const report = createTestReport(id);

      return {
        ...report,
        totalScore: score,
        scoreBreakdown: [
          {
            ...report.scoreBreakdown[0],
            value: score,
            scoreDetails: createScoreDetails(score),
          },
        ],
      };
    };
    const explicitPreviousAnalysis = await repository.create(
      createTestRecordInput({
        latestCommitDate: '2026-06-07T00:00:00.000Z',
        latestCommitSha: 'explicit-previous-sha',
      }),
    );

    await completeAnalysisForTest(
      repository,
      explicitPreviousAnalysis.id,
      createScoredReport(explicitPreviousAnalysis.id, 50),
    );

    await waitForClockTick();

    const automaticPreviousAnalysis = await repository.create(
      createTestRecordInput({
        latestCommitDate: '2026-06-08T00:00:00.000Z',
        latestCommitSha: 'automatic-previous-sha',
      }),
    );

    await completeAnalysisForTest(
      repository,
      automaticPreviousAnalysis.id,
      createScoredReport(automaticPreviousAnalysis.id, 70),
    );

    await waitForClockTick();

    const currentAnalysis = await repository.create(
      createTestRecordInput({
        latestCommitDate: '2026-06-09T00:00:00.000Z',
        latestCommitSha: 'current-sha',
      }),
    );

    await completeAnalysisForTest(
      repository,
      currentAnalysis.id,
      createScoredReport(currentAnalysis.id, 90),
    );

    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/reports/${currentAnalysis.id}/comparison?previousId=${explicitPreviousAnalysis.id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        status: 'available',
        currentReportId: currentAnalysis.id,
        previousReportId: explicitPreviousAnalysis.id,
        totalScore: {
          current: 90,
          previous: 50,
          delta: 40,
        },
      });
    } finally {
      await app.close();
    }
  });

  it('returns unavailable comparison for invalid explicit previous report', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const currentAnalysis = await repository.create(createTestRecordInput());
    const queuedAnalysis = await repository.create(
      createTestRecordInput({
        latestCommitDate: '2026-06-10T00:00:00.000Z',
        latestCommitSha: 'queued-sha',
      }),
    );
    const otherProjectAnalysis = await repository.create(
      createTestRecordInput({
        latestCommitDate: '2026-06-11T00:00:00.000Z',
        latestCommitSha: 'other-project-sha',
        projectPath: 'apps/docs',
      }),
    );
    const otherBranchAnalysis = await repository.create(
      createTestRecordInput({
        branch: 'develop',
        latestCommitDate: '2026-06-12T00:00:00.000Z',
        latestCommitSha: 'other-branch-sha',
      }),
    );

    await completeAnalysisForTest(
      repository,
      currentAnalysis.id,
      createTestReport(currentAnalysis.id),
    );
    await completeAnalysisForTest(
      repository,
      otherProjectAnalysis.id,
      createTestReport(
        otherProjectAnalysis.id,
        otherProjectAnalysis.latestCommitDate,
        otherProjectAnalysis.latestCommitSha,
        'apps/docs',
      ),
    );
    await completeAnalysisForTest(
      repository,
      otherBranchAnalysis.id,
      createTestReport(
        otherBranchAnalysis.id,
        otherBranchAnalysis.latestCommitDate,
        otherBranchAnalysis.latestCommitSha,
        null,
        otherBranchAnalysis.latestCommitTitle,
        'develop',
      ),
    );

    const app = buildApp(
      {},
      {
        reportAnalysisRepository: repository,
        reportAnalyzer: createAnalyzer(),
      },
    );

    try {
      for (const previousId of [
        currentAnalysis.id,
        queuedAnalysis.id,
        otherProjectAnalysis.id,
        otherBranchAnalysis.id,
        'missing-analysis-id',
      ]) {
        const response = await app.inject({
          method: 'GET',
          url: `/reports/${currentAnalysis.id}/comparison?previousId=${previousId}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
          status: 'unavailable',
        });
      }
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

  it('claims recoverable analysis runs with a lease before recovery', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const queuedAnalysis = await repository.create(createTestRecordInput());
    const now = new Date('2026-06-09T00:00:00.000Z');
    const leaseExpiresAt = new Date('2026-06-09T00:05:00.000Z');

    const firstClaim = await repository.claimRecoverable({
      leaseExpiresAt,
      leaseOwnerPrefix: 'worker-a',
      limit: 10,
      now,
    });

    expect(firstClaim).toHaveLength(1);
    expect(firstClaim[0]).toMatchObject({
      id: queuedAnalysis.id,
      leaseExpiresAt,
    });
    expect(firstClaim[0]?.leaseOwner).toMatch(/^worker-a-/u);

    const secondClaim = await repository.claimRecoverable({
      leaseExpiresAt: new Date('2026-06-09T00:06:00.000Z'),
      leaseOwnerPrefix: 'worker-b',
      limit: 10,
      now,
    });

    expect(secondClaim).toHaveLength(0);

    const expiredClaim = await repository.claimRecoverable({
      leaseExpiresAt: new Date('2026-06-09T00:11:00.000Z'),
      leaseOwnerPrefix: 'worker-b',
      limit: 10,
      now: new Date('2026-06-09T00:06:00.000Z'),
    });

    expect(expiredClaim).toHaveLength(1);
    expect(expiredClaim[0]).toMatchObject({
      id: queuedAnalysis.id,
    });
    expect(expiredClaim[0]?.leaseOwner).toMatch(/^worker-b-/u);
    expect(expiredClaim[0]?.leaseOwner).not.toBe(firstClaim[0]?.leaseOwner);

    const completedAnalysis = await repository.complete(
      queuedAnalysis.id,
      createTestReport(queuedAnalysis.id),
      {
        leaseOwner: expiredClaim[0]?.leaseOwner ?? '',
      },
    );

    expect(completedAnalysis.leaseOwner).toBeNull();
    expect(completedAnalysis.leaseExpiresAt).toBeNull();
  });

  it('does not let stale workers refresh another worker lease', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const queuedAnalysis = await repository.create(createTestRecordInput());

    await repository.claimForProcessing({
      id: queuedAnalysis.id,
      leaseExpiresAt: new Date('2026-06-09T00:05:00.000Z'),
      leaseOwner: 'worker-a',
      now: new Date('2026-06-09T00:00:00.000Z'),
    });

    const refreshedAnalysis = await repository.refreshLease({
      id: queuedAnalysis.id,
      leaseExpiresAt: new Date('2026-06-09T00:10:00.000Z'),
      leaseOwner: 'worker-b',
    });

    expect(refreshedAnalysis).toBeNull();
    await expect(repository.findById(queuedAnalysis.id)).resolves.toMatchObject({
      leaseExpiresAt: new Date('2026-06-09T00:05:00.000Z'),
      leaseOwner: 'worker-a',
    });
  });

  it('claims direct worker runs before analyzing', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const queuedAnalysis = await repository.create(createTestRecordInput());
    let observedLeaseOwner: string | null = null;

    await startReportAnalysis({
      analysis: queuedAnalysis,
      analyzer: createAnalyzer({
        analyze: async (analysis) => {
          const runningAnalysis = await repository.findById(analysis.id);
          observedLeaseOwner = runningAnalysis?.leaseOwner ?? null;

          return createTestReport(analysis.id);
        },
      }),
      logger: {
        error: vi.fn(),
      },
      lease: {
        expiresAt: new Date('2026-06-09T00:05:00.000Z'),
        owner: 'worker-a',
      },
      repository,
    });

    const completedAnalysis = await repository.findById(queuedAnalysis.id);

    expect(observedLeaseOwner).toBe('worker-a');
    expect(completedAnalysis).toMatchObject({
      status: 'completed',
      leaseOwner: null,
      leaseExpiresAt: null,
    });
  });

  it('refreshes worker lease while analysis is running', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-09T00:00:00.000Z'));

    try {
      const repository = new InMemoryReportAnalysisRepository();
      const queuedAnalysis = await repository.create(createTestRecordInput());
      const analysisControl: {
        finish?: () => void;
      } = {};
      let resolveAnalysisStarted: (() => void) | null = null;
      const startedPromise = new Promise<void>((resolve) => {
        resolveAnalysisStarted = resolve;
      });
      const runPromise = startReportAnalysis({
        analysis: queuedAnalysis,
        analyzer: createAnalyzer({
          analyze: async (analysis) => {
            resolveAnalysisStarted?.();

            await new Promise<void>((resolve) => {
              analysisControl.finish = resolve;
            });

            return createTestReport(analysis.id);
          },
        }),
        logger: {
          error: vi.fn(),
        },
        lease: {
          expiresAt: new Date('2026-06-09T00:05:00.000Z'),
          owner: 'worker-a',
        },
        repository,
      });

      await startedPromise;
      await vi.advanceTimersByTimeAsync(110_000);

      const runningAnalysis = await repository.findById(queuedAnalysis.id);

      expect(runningAnalysis?.leaseExpiresAt?.getTime()).toBeGreaterThan(
        new Date('2026-06-09T00:05:00.000Z').getTime(),
      );

      analysisControl.finish?.();
      await runPromise;
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not recover a running analysis with an active lease', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const queuedAnalysis = await repository.create(createTestRecordInput());
    const now = new Date('2026-06-09T00:00:00.000Z');

    await repository.claimForProcessing({
      id: queuedAnalysis.id,
      leaseExpiresAt: new Date('2026-06-09T00:05:00.000Z'),
      leaseOwner: 'worker-a',
      now,
    });

    const recoveredAnalyses = await repository.claimRecoverable({
      leaseExpiresAt: new Date('2026-06-09T00:06:00.000Z'),
      leaseOwnerPrefix: 'worker-b',
      limit: 10,
      now: new Date('2026-06-09T00:01:00.000Z'),
    });

    expect(recoveredAnalyses).toHaveLength(0);
  });

  it('does not let stale workers complete or fail another worker lease', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const queuedAnalysis = await repository.create(createTestRecordInput());
    const claimedAnalysis = await repository.claimForProcessing({
      id: queuedAnalysis.id,
      leaseExpiresAt: new Date('2026-06-09T00:05:00.000Z'),
      leaseOwner: 'worker-a',
      now: new Date('2026-06-09T00:00:00.000Z'),
    });

    expect(claimedAnalysis?.leaseOwner).toBe('worker-a');
    await expect(
      repository.complete(queuedAnalysis.id, createTestReport(queuedAnalysis.id), {
        leaseOwner: 'worker-b',
      }),
    ).rejects.toThrow(/lease/u);
    await expect(
      repository.fail(
        queuedAnalysis.id,
        {
          errorCode: 'analysis_failed',
          errorMessage: 'Failed',
        },
        {
          leaseOwner: 'worker-b',
        },
      ),
    ).rejects.toThrow(/lease/u);

    const stillRunningAnalysis = await repository.findById(queuedAnalysis.id);

    expect(stillRunningAnalysis).toMatchObject({
      status: 'running',
      leaseOwner: 'worker-a',
    });
  });
});
