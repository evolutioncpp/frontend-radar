import { getGithubRepositoryKey } from '@frontend-radar/github-repository';
import { describe, expect, it, vi } from 'vitest';

import { InMemoryReportAnalysisRepository } from '../../../test-utils/inMemoryReportAnalysisRepository.js';
import { REPORT_ANALYSIS_VERSION } from '../domain/reportAnalysisConfig.js';
import { createReportAnalysisSnapshotKey } from '../domain/reportAnalysisSnapshot.js';
import {
  DEFAULT_REPORT_BRANCH,
  DEFAULT_REPORT_COMMIT_DATE,
  DEFAULT_REPORT_COMMIT_SHA,
  DEFAULT_REPORT_COMMIT_TITLE,
  createTestProjectReport,
} from '../../../test-utils/reportTestFixtures.js';
import { createReportApplicationService } from './reportApplicationService.js';

import type { ReportAnalyzer } from './ports/reportAnalyzer.js';
import type { ReportAnalyzerRequestContext } from './ports/reportAnalyzer.js';
import type {
  CreateReportAnalysisRecordInput,
  ReportAnalysisEntity,
} from './ports/reportAnalysisRepository.js';

const createTestReport = ({
  branch = DEFAULT_BRANCH,
  id,
  latestCommitDate = DEFAULT_COMMIT_DATE,
  latestCommitSha = DEFAULT_COMMIT_SHA,
  latestCommitTitle = DEFAULT_COMMIT_TITLE,
  score = 100,
}: {
  branch?: string;
  id: string;
  latestCommitDate?: string | null;
  latestCommitSha?: string | null;
  latestCommitTitle?: string | null;
  score?: number;
}) =>
  createTestProjectReport({
    branch,
    id,
    latestCommitDate,
    latestCommitSha,
    latestCommitTitle,
    score,
  });

const DEFAULT_COMMIT_DATE = DEFAULT_REPORT_COMMIT_DATE;
const DEFAULT_COMMIT_SHA = DEFAULT_REPORT_COMMIT_SHA;
const DEFAULT_COMMIT_TITLE = DEFAULT_REPORT_COMMIT_TITLE;
const DEFAULT_BRANCH = DEFAULT_REPORT_BRANCH;

const createRecordInput = (
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
    createTestReport({
      branch: input.branch,
      id: input.id,
      latestCommitDate: input.latestCommitDate,
      latestCommitSha: input.latestCommitSha,
      latestCommitTitle: input.latestCommitTitle,
    }),
  getRepositorySnapshot: async () => ({
    branch: DEFAULT_BRANCH,
    defaultBranch: DEFAULT_BRANCH,
    latestCommitDate: DEFAULT_COMMIT_DATE,
    latestCommitSha: DEFAULT_COMMIT_SHA,
    latestCommitTitle: DEFAULT_COMMIT_TITLE,
  }),
  listRepositoryBranches: async () => ({
    branches: [
      {
        isDefault: true,
        name: DEFAULT_BRANCH,
      },
    ],
    defaultBranch: DEFAULT_BRANCH,
    isTruncated: false,
  }),
  resolveProjectPath: async (_owner, _repository, _ref, projectPath) => projectPath ?? '',
  validateGithubToken: async () => undefined,
  ...overrides,
});

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
  analysis: ReportAnalysisEntity,
  report = createTestReport({ id: analysis.id }),
) => {
  const { leaseOwner } = await claimAnalysisForTest(repository, analysis.id);

  return repository.complete(analysis.id, report, { leaseOwner });
};

const failAnalysisForTest = async (
  repository: InMemoryReportAnalysisRepository,
  analysis: ReportAnalysisEntity,
) => {
  const { leaseOwner } = await claimAnalysisForTest(repository, analysis.id);

  return repository.fail(
    analysis.id,
    {
      errorCode: 'analysis_failed',
      errorMessage: 'Failed',
    },
    { leaseOwner },
  );
};

const createService = (
  overrides: {
    analyzer?: ReportAnalyzer;
    repository?: InMemoryReportAnalysisRepository;
    startAnalysis?: (analysis: ReportAnalysisEntity) => void;
  } = {},
) => {
  const repository = overrides.repository ?? new InMemoryReportAnalysisRepository();
  const analyzer = overrides.analyzer ?? createAnalyzer();
  const startAnalysis =
    overrides.startAnalysis ??
    vi.fn<(analysis: ReportAnalysisEntity, context?: ReportAnalyzerRequestContext) => void>();

  return {
    analyzer,
    repository,
    service: createReportApplicationService({
      analyzer,
      repository,
      startAnalysis,
    }),
    startAnalysis,
  };
};

describe('report application service', () => {
  it('creates a new queued analysis from repository snapshot', async () => {
    const { repository, service, startAnalysis } = createService();

    const result = await service.createReportAnalysis({
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      repository: 'repo',
    });

    expect(result).toMatchObject({
      body: {
        reuseReason: null,
        status: 'queued',
      },
      statusCode: 201,
      type: 'success',
    });

    if (result.type !== 'success') {
      throw new Error('Expected successful analysis creation');
    }

    const analysis = await repository.findById(result.body.id);

    expect(analysis).toMatchObject({
      branch: DEFAULT_BRANCH,
      latestCommitSha: DEFAULT_COMMIT_SHA,
      latestCommitTitle: DEFAULT_COMMIT_TITLE,
      projectPath: '',
      projectPathSource: 'autodetect',
      status: 'queued',
    });
    expect(startAnalysis).toHaveBeenCalledOnce();
    expect(startAnalysis).toHaveBeenCalledWith(expect.objectContaining({ id: result.body.id }), {});
  });

  it('passes GitHub token context to precheck and worker start', async () => {
    const getRepositorySnapshot = vi.fn(createAnalyzer().getRepositorySnapshot);
    const resolveProjectPath = vi.fn(createAnalyzer().resolveProjectPath);
    const { service, startAnalysis } = createService({
      analyzer: createAnalyzer({
        getRepositorySnapshot,
        resolveProjectPath,
      }),
    });
    const context = {
      githubToken: 'github_pat_request',
    };

    const result = await service.createReportAnalysis(
      {
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        repository: 'repo',
      },
      context,
    );

    expect(result).toMatchObject({
      statusCode: 201,
      type: 'success',
    });
    expect(getRepositorySnapshot).toHaveBeenCalledWith('owner', 'repo', undefined, context);
    expect(resolveProjectPath).toHaveBeenCalledWith(
      'owner',
      'repo',
      DEFAULT_COMMIT_SHA,
      undefined,
      undefined,
      context,
    );
    expect(startAnalysis).toHaveBeenCalledWith(expect.any(Object), context);
  });

  it('creates hidden analysis that is not returned from history', async () => {
    const { repository, service } = createService();

    const result = await service.createReportAnalysis({
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      repository: 'repo',
      saveToHistory: false,
    });

    if (result.type !== 'success') {
      throw new Error('Expected successful analysis creation');
    }

    const analysis = await repository.findById(result.body.id);
    const history = await service.listReportAnalyses();

    expect(analysis).toMatchObject({
      isHistoryVisible: false,
    });
    expect(history).toMatchObject({
      body: {
        items: [],
      },
      statusCode: 200,
      type: 'success',
    });
  });

  it('does not reuse analysis with a different metric category set', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const completedAnalysis = await repository.create(createRecordInput());

    await completeAnalysisForTest(repository, completedAnalysis);

    const { service, startAnalysis } = createService({ repository });

    const result = await service.createReportAnalysis({
      enabledScoreCategories: ['testing'],
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      repository: 'repo',
    });

    expect(result).toMatchObject({
      body: {
        reuseReason: null,
        status: 'queued',
      },
      statusCode: 201,
      type: 'success',
    });

    if (result.type !== 'success') {
      throw new Error('Expected successful analysis creation');
    }

    expect(result.body.id).not.toBe(completedAnalysis.id);
    expect(startAnalysis).toHaveBeenCalledOnce();
  });

  it('does not treat unbranded analyzer-like errors as user-facing GitHub errors', async () => {
    const { service } = createService({
      analyzer: createAnalyzer({
        getRepositorySnapshot: async () => {
          throw Object.assign(new Error('Not an analyzer API error'), {
            code: 'repository_not_found',
          });
        },
      }),
    });

    const result = await service.createReportAnalysis({
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      repository: 'repo',
    });

    expect(result).toMatchObject({
      error: {
        code: 'repository_verification_failed',
        statusCode: 502,
      },
      type: 'error',
    });
  });

  it('reuses a completed analysis for the same repository snapshot', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const completedAnalysis = await repository.create(createRecordInput());

    await completeAnalysisForTest(repository, completedAnalysis);

    const { service, startAnalysis } = createService({ repository });

    const result = await service.createReportAnalysis({
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      repository: 'repo',
    });

    expect(result).toMatchObject({
      body: {
        id: completedAnalysis.id,
        reuseReason: 'completed',
        status: 'completed',
      },
      statusCode: 200,
      type: 'success',
    });
    expect(startAnalysis).not.toHaveBeenCalled();
  });

  it('resets failed analysis on retry and starts processing again', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const failedAnalysis = await repository.create(createRecordInput());

    await failAnalysisForTest(repository, failedAnalysis);

    const { service, startAnalysis } = createService({ repository });
    const result = await service.retryReportAnalysis(failedAnalysis.id);
    const retriedAnalysis = await repository.findById(failedAnalysis.id);

    expect(result).toMatchObject({
      body: {
        id: failedAnalysis.id,
        retryReason: 'retried',
        status: 'queued',
      },
      statusCode: 200,
      type: 'success',
    });
    expect(retriedAnalysis).toMatchObject({
      errorCode: null,
      errorMessage: null,
      status: 'queued',
    });
    expect(startAnalysis).toHaveBeenCalledOnce();
  });

  it('validates GitHub token through analyzer', async () => {
    const validateGithubToken = vi.fn(async () => undefined);
    const { service } = createService({
      analyzer: createAnalyzer({
        validateGithubToken,
      }),
    });
    const context = {
      githubToken: 'github_pat_valid',
    };

    const result = await service.validateGithubToken(context);

    expect(result).toMatchObject({
      body: {
        status: 'valid',
      },
      statusCode: 200,
      type: 'success',
    });
    expect(validateGithubToken).toHaveBeenCalledWith(context);
  });

  it('does not validate missing GitHub token through analyzer', async () => {
    const validateGithubToken = vi.fn(async () => undefined);
    const { service } = createService({
      analyzer: createAnalyzer({
        validateGithubToken,
      }),
    });

    const result = await service.validateGithubToken({});

    expect(result).toMatchObject({
      error: {
        code: 'repository_forbidden',
        statusCode: 403,
      },
      type: 'error',
    });
    expect(validateGithubToken).not.toHaveBeenCalled();
  });

  it('returns up-to-date refresh without creating another run for the same snapshot', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const completedAnalysis = await repository.create(createRecordInput());

    await completeAnalysisForTest(repository, completedAnalysis);

    const { service, startAnalysis } = createService({ repository });
    const result = await service.refreshReportAnalysis(completedAnalysis.id);

    expect(result).toMatchObject({
      body: {
        id: completedAnalysis.id,
        refreshReason: 'up_to_date',
        status: 'completed',
      },
      statusCode: 200,
      type: 'success',
    });
    expect(startAnalysis).not.toHaveBeenCalled();
  });

  it('creates a new refresh run when the repository snapshot changed', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const completedAnalysis = await repository.create(createRecordInput());

    await completeAnalysisForTest(repository, completedAnalysis);

    const { service, startAnalysis } = createService({
      analyzer: createAnalyzer({
        getRepositorySnapshot: async () => ({
          branch: DEFAULT_BRANCH,
          defaultBranch: DEFAULT_BRANCH,
          latestCommitDate: '2026-06-10T00:00:00.000Z',
          latestCommitSha: 'def456',
          latestCommitTitle: 'Improve frontend analysis',
        }),
      }),
      repository,
    });
    const result = await service.refreshReportAnalysis(completedAnalysis.id);

    expect(result).toMatchObject({
      body: {
        refreshReason: 'created',
        status: 'queued',
      },
      statusCode: 201,
      type: 'success',
    });
    expect(startAnalysis).toHaveBeenCalledOnce();
  });

  it('compares current report with explicit previous report', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const previousAnalysis = await repository.create(
      createRecordInput({
        latestCommitDate: '2026-06-08T00:00:00.000Z',
        latestCommitSha: 'old123',
      }),
    );
    const currentAnalysis = await repository.create(
      createRecordInput({
        latestCommitDate: '2026-06-09T00:00:00.000Z',
        latestCommitSha: 'new123',
      }),
    );

    await completeAnalysisForTest(
      repository,
      previousAnalysis,
      createTestReport({
        id: previousAnalysis.id,
        latestCommitDate: previousAnalysis.latestCommitDate,
        latestCommitSha: previousAnalysis.latestCommitSha,
        score: 70,
      }),
    );
    await completeAnalysisForTest(
      repository,
      currentAnalysis,
      createTestReport({
        id: currentAnalysis.id,
        latestCommitDate: currentAnalysis.latestCommitDate,
        latestCommitSha: currentAnalysis.latestCommitSha,
        score: 90,
      }),
    );

    const { service } = createService({ repository });
    const result = await service.getReportComparison({
      id: currentAnalysis.id,
      language: 'en',
      previousId: previousAnalysis.id,
    });

    expect(result).toMatchObject({
      body: {
        currentReportId: currentAnalysis.id,
        previousReportId: previousAnalysis.id,
        status: 'available',
        totalScore: {
          current: 90,
          delta: 20,
          previous: 70,
        },
      },
      statusCode: 200,
      type: 'success',
    });
  });

  it('explains unavailable comparison when metric sets differ', async () => {
    const repository = new InMemoryReportAnalysisRepository();
    const previousAnalysis = await repository.create(
      createRecordInput({
        latestCommitDate: '2026-06-08T00:00:00.000Z',
        latestCommitSha: 'old123',
      }),
    );
    const currentAnalysis = await repository.create(
      createRecordInput({
        latestCommitDate: '2026-06-09T00:00:00.000Z',
        latestCommitSha: 'new123',
        scoreCategoriesKey: 'testing,dependencies',
      }),
    );

    await completeAnalysisForTest(repository, previousAnalysis);
    await completeAnalysisForTest(repository, currentAnalysis);

    const { service } = createService({ repository });
    const result = await service.getReportComparison({
      id: currentAnalysis.id,
      language: 'en',
      previousId: previousAnalysis.id,
    });

    expect(result).toMatchObject({
      body: {
        reason: 'different_score_categories',
        status: 'unavailable',
      },
      statusCode: 200,
      type: 'success',
    });
  });
});
