import { getGithubRepositoryKey } from '@frontend-radar/github-repository';

import {
  isReportAnalyzerApiError,
  isReportProjectPathNotFoundError,
  type ReportAnalyzer,
  type ReportAnalyzerRequestContext,
} from './ports/reportAnalyzer.js';
import { REPORT_ANALYSIS_VERSION, reportHistoryLimit } from '../domain/reportAnalysisConfig.js';
import { createReportAnalysisSnapshotKey } from '../domain/reportAnalysisSnapshot.js';
import { buildReportComparison } from '../domain/reportComparison.js';
import {
  getLocalizedReportErrorMessage,
  localizeProjectReport,
} from '../localization/reportLocalization.js';
import {
  isReportAnalysisAlreadyExistsError,
  type ReportAnalysisEntity,
  type ReportAnalysisRepository,
  type ReportAnalysisSnapshotLookup,
} from './ports/reportAnalysisRepository.js';

import type {
  CreateReportAnalysisRequest,
  CreateReportAnalysisResponse,
  GetReportComparisonResponse,
  GetReportAnalysisResponse,
  ListReportAnalysesResponse,
  ListRepositoryBranchesResponse,
  RefreshReportAnalysisResponse,
  ReportAnalysisErrorCode,
  RetryReportAnalysisResponse,
  ValidateGithubTokenResponse,
} from '../domain/reportSchemas.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export interface ReportApplicationWarning {
  context: Record<string, unknown>;
  message: string;
}

export type ReportApplicationError =
  | {
      reason: 'localized_code';
      code: ReportAnalysisErrorCode;
      statusCode: number;
      warning?: ReportApplicationWarning;
    }
  | {
      reason: 'not_found';
      statusCode: 404;
    }
  | {
      reason: 'refresh_unavailable';
      statusCode: 409;
    };

export type ReportApplicationResult<TBody> =
  | {
      body: TBody;
      statusCode: number;
      type: 'success';
    }
  | {
      error: ReportApplicationError;
      type: 'error';
    };

export type CreateReportAnalysisResultBody = CreateReportAnalysisResponse;
export type RetryReportAnalysisResultBody = RetryReportAnalysisResponse;
export type RefreshReportAnalysisResultBody = RefreshReportAnalysisResponse;
export type GetReportAnalysisResultBody = GetReportAnalysisResponse;
export type ValidateGithubTokenResultBody = ValidateGithubTokenResponse;
export type ReportAnalysisProcessingSummary = Extract<
  GetReportAnalysisResponse,
  { status: 'queued' | 'running' }
>['analysis'];

interface ReportApplicationServiceOptions {
  analyzer: ReportAnalyzer;
  repository: ReportAnalysisRepository;
  startAnalysis: (analysis: ReportAnalysisEntity, context?: ReportAnalyzerRequestContext) => void;
}

export interface ReportApplicationService {
  createReportAnalysis(
    request: CreateReportAnalysisRequest,
    context?: ReportAnalyzerRequestContext,
  ): Promise<ReportApplicationResult<CreateReportAnalysisResultBody>>;
  getReportAnalysis(
    id: string,
    language: SupportedLanguage,
  ): Promise<ReportApplicationResult<GetReportAnalysisResultBody>>;
  getReportComparison(input: {
    id: string;
    language: SupportedLanguage;
    previousId?: string;
  }): Promise<ReportApplicationResult<GetReportComparisonResponse>>;
  listReportAnalyses(): Promise<ReportApplicationResult<ListReportAnalysesResponse>>;
  listRepositoryBranches(
    owner: string,
    repository: string,
    context?: ReportAnalyzerRequestContext,
  ): Promise<ReportApplicationResult<ListRepositoryBranchesResponse>>;
  refreshReportAnalysis(
    id: string,
    context?: ReportAnalyzerRequestContext,
  ): Promise<ReportApplicationResult<RefreshReportAnalysisResultBody>>;
  retryReportAnalysis(
    id: string,
    context?: ReportAnalyzerRequestContext,
  ): Promise<ReportApplicationResult<RetryReportAnalysisResultBody>>;
  validateGithubToken(
    context: ReportAnalyzerRequestContext,
  ): Promise<ReportApplicationResult<ValidateGithubTokenResultBody>>;
}

export const getGithubErrorHttpStatus = (code: string) => {
  if (code === 'repository_not_found') {
    return 404;
  }

  if (code === 'repository_forbidden') {
    return 403;
  }

  if (code === 'github_rate_limited') {
    return 429;
  }

  if (code === 'branch_not_found') {
    return 422;
  }

  return 502;
};

export const createReportAnalysisProcessingSummary = (
  analysis: ReportAnalysisEntity,
): ReportAnalysisProcessingSummary => ({
  owner: analysis.owner,
  repository: analysis.repository,
  normalizedUrl: analysis.normalizedUrl,
  branch: analysis.branch,
  projectPath: analysis.projectPath || null,
  latestCommitDate: analysis.latestCommitDate,
  latestCommitSha: analysis.latestCommitSha,
  latestCommitTitle: analysis.latestCommitTitle,
  progress: {
    stage: analysis.progressStage,
    updatedAt: analysis.progressUpdatedAt.toISOString(),
  },
  startedAt: analysis.startedAt?.toISOString() ?? null,
  createdAt: analysis.createdAt.toISOString(),
  updatedAt: analysis.updatedAt.toISOString(),
});

const createSnapshotLookup = (
  repositoryKey: string,
  branch: string,
  projectPath: string,
  latestCommitDate: string | null,
  latestCommitSha: string | null,
): ReportAnalysisSnapshotLookup => {
  return {
    analysisVersion: REPORT_ANALYSIS_VERSION,
    branch,
    projectPath,
    repositoryKey,
    snapshotKey: createReportAnalysisSnapshotKey({
      latestCommitDate,
      latestCommitSha,
    }),
  };
};

const getProjectPathSource = ({
  projectPath,
  projectPathSource,
}: Pick<CreateReportAnalysisRequest, 'projectPath' | 'projectPathSource'>) => {
  if (!projectPath) {
    return 'autodetect' as const;
  }

  return projectPathSource ?? 'manual';
};

const success = <TBody>(statusCode: number, body: TBody): ReportApplicationResult<TBody> => ({
  body,
  statusCode,
  type: 'success',
});

const localizedError = (
  code: ReportAnalysisErrorCode,
  statusCode = getGithubErrorHttpStatus(code),
  warning?: ReportApplicationWarning,
): ReportApplicationResult<never> => ({
  error: {
    code,
    reason: 'localized_code',
    statusCode,
    warning,
  },
  type: 'error',
});

const notFound = (): ReportApplicationResult<never> => ({
  error: {
    reason: 'not_found',
    statusCode: 404,
  },
  type: 'error',
});

const refreshUnavailable = (): ReportApplicationResult<never> => ({
  error: {
    reason: 'refresh_unavailable',
    statusCode: 409,
  },
  type: 'error',
});

const createVerificationFailedError = (
  warning: ReportApplicationWarning,
): ReportApplicationResult<never> => {
  return localizedError('repository_verification_failed', 502, warning);
};

export const createReportApplicationService = ({
  analyzer,
  repository,
  startAnalysis,
}: ReportApplicationServiceOptions): ReportApplicationService => {
  const createReusableAnalysisResponse = async (
    analysis: ReportAnalysisEntity,
    context: ReportAnalyzerRequestContext = {},
  ): Promise<ReportApplicationResult<CreateReportAnalysisResultBody>> => {
    let reusableAnalysis = analysis;

    if (reusableAnalysis.status !== 'failed') {
      reusableAnalysis = await repository.touch(reusableAnalysis.id);

      if (reusableAnalysis.status === 'completed') {
        return success(200, {
          id: reusableAnalysis.id,
          reuseReason: 'completed',
          status: 'completed',
        });
      }

      if (reusableAnalysis.status === 'queued' || reusableAnalysis.status === 'running') {
        return success(200, {
          id: reusableAnalysis.id,
          reuseReason: 'active',
          status: reusableAnalysis.status,
        });
      }
    }

    const retriedAnalysis = await repository.resetForRetry(reusableAnalysis.id);

    startAnalysis(retriedAnalysis, context);

    return success(200, {
      id: retriedAnalysis.id,
      reuseReason: 'retried',
      status: 'queued',
    });
  };

  const createRefreshReusableAnalysisResponse = async (
    analysis: ReportAnalysisEntity,
    context: ReportAnalyzerRequestContext = {},
  ): Promise<ReportApplicationResult<RefreshReportAnalysisResultBody>> => {
    if (analysis.status === 'failed') {
      const retriedAnalysis = await repository.resetForRetry(analysis.id);

      startAnalysis(retriedAnalysis, context);

      return success(200, {
        id: retriedAnalysis.id,
        refreshReason: 'created',
        status: 'queued',
      });
    }

    const refreshedAnalysis = await repository.touch(analysis.id);

    if (refreshedAnalysis.status === 'failed') {
      const retriedAnalysis = await repository.resetForRetry(refreshedAnalysis.id);

      startAnalysis(retriedAnalysis, context);

      return success(200, {
        id: retriedAnalysis.id,
        refreshReason: 'created',
        status: 'queued',
      });
    }

    return success(200, {
      id: refreshedAnalysis.id,
      refreshReason: 'reused',
      status: refreshedAnalysis.status,
    });
  };

  return {
    async listRepositoryBranches(owner, repositoryName, context = {}) {
      try {
        return success(200, await analyzer.listRepositoryBranches(owner, repositoryName, context));
      } catch (error) {
        if (isReportAnalyzerApiError(error)) {
          return localizedError(error.code);
        }

        return createVerificationFailedError({
          context: {
            error,
            owner,
            repository: repositoryName,
          },
          message: 'Failed to load repository branches',
        });
      }
    },

    async createReportAnalysis(request, context = {}) {
      const repositoryKey = getGithubRepositoryKey(request.owner, request.repository);
      let latestCommitDate: string | null = null;
      let latestCommitSha: string | null = null;
      let latestCommitTitle: string | null = null;
      let branch = '';
      let projectPath = '';
      const projectPathSource = getProjectPathSource(request);
      let analysisRef = 'main';

      try {
        const snapshot = await analyzer.getRepositorySnapshot(
          request.owner,
          request.repository,
          request.branch,
          context,
        );

        branch = snapshot.branch;
        latestCommitDate = snapshot.latestCommitDate;
        latestCommitSha = snapshot.latestCommitSha;
        latestCommitTitle = snapshot.latestCommitTitle;
        analysisRef = latestCommitSha ?? snapshot.branch;
        projectPath = await analyzer.resolveProjectPath(
          request.owner,
          request.repository,
          analysisRef,
          request.projectPath,
          request.projectPathSource,
          context,
        );
      } catch (error) {
        if (isReportProjectPathNotFoundError(error)) {
          return localizedError('project_path_not_found', 422);
        }

        if (isReportAnalyzerApiError(error)) {
          return localizedError(error.code);
        }

        return createVerificationFailedError({
          context: {
            error,
            owner: request.owner,
            repository: request.repository,
          },
          message: 'Failed to verify repository before analysis',
        });
      }

      const snapshotLookup = createSnapshotLookup(
        repositoryKey,
        branch,
        projectPath,
        latestCommitDate,
        latestCommitSha,
      );
      const reusableAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

      if (reusableAnalysis) {
        return createReusableAnalysisResponse(reusableAnalysis, context);
      }

      let analysis: ReportAnalysisEntity;

      try {
        analysis = await repository.create({
          ...request,
          ...snapshotLookup,
          branch,
          latestCommitDate,
          latestCommitSha,
          latestCommitTitle,
          projectPath,
          projectPathSource,
        });
      } catch (error) {
        if (isReportAnalysisAlreadyExistsError(error)) {
          const concurrentAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

          if (concurrentAnalysis) {
            return createReusableAnalysisResponse(concurrentAnalysis, context);
          }
        }

        throw error;
      }

      startAnalysis(analysis, context);

      return success(201, {
        id: analysis.id,
        reuseReason: null,
        status: 'queued',
      });
    },

    async listReportAnalyses() {
      const analyses = await repository.findLatest(reportHistoryLimit);

      return success(200, {
        items: analyses.map((analysis) => ({
          id: analysis.id,
          owner: analysis.owner,
          repository: analysis.repository,
          normalizedUrl: analysis.normalizedUrl,
          branch: analysis.branch,
          status: analysis.status,
          projectPath: analysis.projectPath || null,
          latestCommitDate: analysis.latestCommitDate,
          latestCommitSha: analysis.latestCommitSha,
          latestCommitTitle: analysis.latestCommitTitle,
          createdAt: analysis.createdAt.toISOString(),
          updatedAt: analysis.updatedAt.toISOString(),
          ...(analysis.report
            ? {
                checksCount: analysis.report.checks.length,
                metricsCount: analysis.report.scoreBreakdown.length,
                recommendationsCount: analysis.report.recommendations.length,
                score: analysis.report.totalScore,
              }
            : {}),
        })),
      });
    },

    async retryReportAnalysis(id, context = {}) {
      const analysis = await repository.findById(id);

      if (!analysis) {
        return notFound();
      }

      let retryTarget = analysis;

      if (analysis.status !== 'failed') {
        const refreshedAnalysis = await repository.touch(analysis.id);

        if (refreshedAnalysis.status === 'completed') {
          return success(200, {
            id: refreshedAnalysis.id,
            retryReason: 'completed',
            status: 'completed',
          });
        }

        if (refreshedAnalysis.status === 'queued' || refreshedAnalysis.status === 'running') {
          return success(200, {
            id: refreshedAnalysis.id,
            retryReason: 'active',
            status: refreshedAnalysis.status,
          });
        }

        retryTarget = refreshedAnalysis;
      }

      const retriedAnalysis = await repository.resetForRetry(retryTarget.id);

      startAnalysis(retriedAnalysis, context);

      return success(200, {
        id: retriedAnalysis.id,
        retryReason: 'retried',
        status: 'queued',
      });
    },

    async refreshReportAnalysis(id, context = {}) {
      const currentAnalysis = await repository.findById(id);

      if (!currentAnalysis) {
        return notFound();
      }

      if (currentAnalysis.status !== 'completed' || !currentAnalysis.report) {
        return refreshUnavailable();
      }

      let latestCommitDate: string | null = null;
      let latestCommitSha: string | null = null;
      let latestCommitTitle: string | null = null;
      let branch = currentAnalysis.branch;
      let analysisRef = currentAnalysis.branch || 'main';

      try {
        const snapshot = await analyzer.getRepositorySnapshot(
          currentAnalysis.owner,
          currentAnalysis.repository,
          currentAnalysis.branch,
          context,
        );

        branch = snapshot.branch;
        latestCommitDate = snapshot.latestCommitDate;
        latestCommitSha = snapshot.latestCommitSha;
        latestCommitTitle = snapshot.latestCommitTitle;
        analysisRef = latestCommitSha ?? snapshot.branch;

        await analyzer.resolveProjectPath(
          currentAnalysis.owner,
          currentAnalysis.repository,
          analysisRef,
          currentAnalysis.projectPath,
          currentAnalysis.projectPathSource,
          context,
        );
      } catch (error) {
        if (isReportProjectPathNotFoundError(error)) {
          return localizedError('project_path_not_found', 422);
        }

        if (isReportAnalyzerApiError(error)) {
          return localizedError(error.code);
        }

        return createVerificationFailedError({
          context: {
            error,
            id: currentAnalysis.id,
            owner: currentAnalysis.owner,
            repository: currentAnalysis.repository,
          },
          message: 'Failed to verify repository before report refresh',
        });
      }

      const snapshotLookup = createSnapshotLookup(
        currentAnalysis.repositoryKey,
        branch,
        currentAnalysis.projectPath,
        latestCommitDate,
        latestCommitSha,
      );

      if (snapshotLookup.snapshotKey === currentAnalysis.snapshotKey) {
        return success(200, {
          id: currentAnalysis.id,
          refreshReason: 'up_to_date',
          status: 'completed',
        });
      }

      const reusableAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

      if (reusableAnalysis) {
        return createRefreshReusableAnalysisResponse(reusableAnalysis, context);
      }

      let newAnalysis: ReportAnalysisEntity;

      try {
        newAnalysis = await repository.create({
          analysisVersion: REPORT_ANALYSIS_VERSION,
          latestCommitDate,
          latestCommitSha,
          latestCommitTitle,
          normalizedUrl: currentAnalysis.normalizedUrl,
          owner: currentAnalysis.owner,
          branch,
          projectPath: currentAnalysis.projectPath,
          projectPathSource: currentAnalysis.projectPathSource,
          repository: currentAnalysis.repository,
          repositoryKey: currentAnalysis.repositoryKey,
          snapshotKey: snapshotLookup.snapshotKey,
        });
      } catch (error) {
        if (isReportAnalysisAlreadyExistsError(error)) {
          const concurrentAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

          if (concurrentAnalysis) {
            return createRefreshReusableAnalysisResponse(concurrentAnalysis, context);
          }
        }

        throw error;
      }

      startAnalysis(newAnalysis, context);

      return success(201, {
        id: newAnalysis.id,
        refreshReason: 'created',
        status: 'queued',
      });
    },

    async validateGithubToken(context) {
      if (!context.githubToken) {
        return localizedError('repository_forbidden', 403);
      }

      try {
        await analyzer.validateGithubToken(context);

        return success(200, {
          status: 'valid',
        } satisfies ValidateGithubTokenResultBody);
      } catch (error) {
        if (isReportAnalyzerApiError(error)) {
          return localizedError(error.code);
        }

        return createVerificationFailedError({
          context: {
            error,
          },
          message: 'Failed to validate GitHub token',
        });
      }
    },

    async getReportComparison({ id, language, previousId }) {
      const analysis = await repository.findById(id);

      if (!analysis || analysis.status !== 'completed' || !analysis.report) {
        return notFound();
      }

      const previousAnalysis = previousId
        ? await repository.findById(previousId)
        : await repository.findPreviousCompleted(analysis);

      if (
        !previousAnalysis?.report ||
        previousAnalysis.id === analysis.id ||
        previousAnalysis.repositoryKey !== analysis.repositoryKey ||
        previousAnalysis.projectPath !== analysis.projectPath ||
        previousAnalysis.branch !== analysis.branch ||
        previousAnalysis.status !== 'completed'
      ) {
        return success(200, {
          status: 'unavailable',
        } satisfies GetReportComparisonResponse);
      }

      return success(
        200,
        buildReportComparison(
          localizeProjectReport(analysis.report, language),
          localizeProjectReport(previousAnalysis.report, language),
        ),
      );
    },

    async getReportAnalysis(id, language) {
      const analysis = await repository.findById(id);

      if (!analysis) {
        return notFound();
      }

      if (analysis.status === 'completed') {
        if (!analysis.report) {
          return notFound();
        }

        return success(200, {
          id: analysis.id,
          report: localizeProjectReport(analysis.report, language),
          status: 'completed',
        });
      }

      if (analysis.status === 'failed') {
        const errorCode = analysis.errorCode ?? 'analysis_failed';

        return success(200, {
          id: analysis.id,
          status: 'failed',
          errorCode,
          errorMessage: getLocalizedReportErrorMessage(errorCode, language),
        });
      }

      return success(200, {
        id: analysis.id,
        analysis: createReportAnalysisProcessingSummary(analysis),
        status: analysis.status,
      });
    },
  };
};
