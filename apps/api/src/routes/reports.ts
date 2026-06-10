import { getGithubRepositoryKey } from '@frontend-radar/github-repository';

import { startReportAnalysis } from '../modules/reports/reportAnalysisWorker.js';
import {
  acceptLanguageHeadersSchema,
  createReportAnalysisRequestSchema,
  createReportAnalysisResponseSchema,
  errorResponseSchema,
  getReportComparisonQuerySchema,
  getReportComparisonResponseSchema,
  getReportAnalysisResponseSchema,
  listRepositoryBranchesResponseSchema,
  listReportAnalysesResponseSchema,
  reportAnalysisParamsSchema,
  repositoryBranchesParamsSchema,
  refreshReportAnalysisResponseSchema,
  retryReportAnalysisResponseSchema,
} from '../modules/reports/reportSchemas.js';
import { isGithubApiError } from '../modules/reports/githubReportAnalyzer.js';
import {
  REPORT_ANALYSIS_VERSION,
  reportHistoryLimit,
} from '../modules/reports/reportAnalysisConfig.js';
import { createReportAnalysisSnapshotKey } from '../modules/reports/reportAnalysisSnapshot.js';
import { isReportProjectPathNotFoundError } from '../modules/reports/reportProjectDetector.js';
import { buildReportComparison } from '../modules/reports/reportComparison.js';
import { getReportLanguage } from '../modules/reports/reportLanguage.js';
import {
  getLocalizedReportErrorMessage,
  getLocalizedReportNotFoundMessage,
  getLocalizedReportRefreshUnavailableMessage,
  localizeProjectReport,
} from '../modules/reports/reportLocalization.js';

import type { ReportAnalyzer } from '../modules/reports/githubReportAnalyzer.js';
import type {
  ReportAnalysisEntity,
  ReportAnalysisSnapshotLookup,
  ReportAnalysisRepository,
} from '../modules/reports/reportAnalysisRepository.js';
import type { CreateReportAnalysisRequest } from '../modules/reports/reportSchemas.js';
import { isReportAnalysisAlreadyExistsError } from '../modules/reports/reportAnalysisRepository.js';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const getGithubErrorHttpStatus = (code: string) => {
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

interface ReportRoutesOptions {
  analyzer: ReportAnalyzer;
  repository: ReportAnalysisRepository;
  startAnalysis?: (analysis: ReportAnalysisEntity) => void;
}

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

const createReportAnalysisProcessingSummary = (analysis: ReportAnalysisEntity) => ({
  owner: analysis.owner,
  repository: analysis.repository,
  normalizedUrl: analysis.normalizedUrl,
  branch: analysis.branch,
  projectPath: analysis.projectPath || null,
  latestCommitDate: analysis.latestCommitDate,
  latestCommitSha: analysis.latestCommitSha,
  latestCommitTitle: analysis.latestCommitTitle,
  createdAt: analysis.createdAt.toISOString(),
  updatedAt: analysis.updatedAt.toISOString(),
});

const getProjectPathSource = ({
  projectPath,
  projectPathSource,
}: Pick<CreateReportAnalysisRequest, 'projectPath' | 'projectPathSource'>) => {
  if (!projectPath) {
    return 'autodetect' as const;
  }

  return projectPathSource ?? 'manual';
};

export const createReportRoutes = ({
  analyzer,
  repository,
  startAnalysis,
}: ReportRoutesOptions): FastifyPluginAsyncZod => {
  return async (app) => {
    const runAnalysis =
      startAnalysis ??
      ((analysis: ReportAnalysisEntity) => {
        void startReportAnalysis({
          analysis,
          analyzer,
          logger: app.log,
          repository,
        });
      });

    app.get(
      '/repositories/:owner/:repository/branches',
      {
        schema: {
          tags: ['Repositories'],
          operationId: 'listRepositoryBranches',
          headers: acceptLanguageHeadersSchema,
          params: repositoryBranchesParamsSchema,
          response: {
            200: listRepositoryBranchesResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            429: errorResponseSchema,
            422: errorResponseSchema,
            502: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);

        try {
          return await analyzer.listRepositoryBranches(
            request.params.owner,
            request.params.repository,
          );
        } catch (error) {
          if (isGithubApiError(error)) {
            return reply.code(getGithubErrorHttpStatus(error.code)).send({
              code: error.code,
              message: getLocalizedReportErrorMessage(error.code, language),
            });
          }

          request.log.warn(
            {
              error,
              owner: request.params.owner,
              repository: request.params.repository,
            },
            'Failed to load repository branches',
          );

          return reply.code(502).send({
            code: 'repository_verification_failed',
            message: getLocalizedReportErrorMessage('repository_verification_failed', language),
          });
        }
      },
    );

    app.post(
      '/reports/analyze',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'createReportAnalysis',
          body: createReportAnalysisRequestSchema,
          headers: acceptLanguageHeadersSchema,
          response: {
            200: createReportAnalysisResponseSchema,
            201: createReportAnalysisResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            429: errorResponseSchema,
            422: errorResponseSchema,
            502: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);
        const repositoryKey = getGithubRepositoryKey(request.body.owner, request.body.repository);
        let latestCommitDate: string | null = null;
        let latestCommitSha: string | null = null;
        let latestCommitTitle: string | null = null;
        let branch = '';
        let projectPath = '';
        const projectPathSource = getProjectPathSource(request.body);
        let analysisRef = 'main';

        try {
          const snapshot = await analyzer.getRepositorySnapshot(
            request.body.owner,
            request.body.repository,
            request.body.branch,
          );

          branch = snapshot.branch;
          latestCommitDate = snapshot.latestCommitDate;
          latestCommitSha = snapshot.latestCommitSha;
          latestCommitTitle = snapshot.latestCommitTitle;
          analysisRef = latestCommitSha ?? snapshot.branch;
          projectPath = await analyzer.resolveProjectPath(
            request.body.owner,
            request.body.repository,
            analysisRef,
            request.body.projectPath,
            request.body.projectPathSource,
          );
        } catch (error) {
          if (isReportProjectPathNotFoundError(error)) {
            return reply.code(422).send({
              code: 'project_path_not_found',
              message: getLocalizedReportErrorMessage('project_path_not_found', language),
            });
          }

          if (isGithubApiError(error)) {
            return reply.code(getGithubErrorHttpStatus(error.code)).send({
              code: error.code,
              message: getLocalizedReportErrorMessage(error.code, language),
            });
          }

          request.log.warn(
            {
              error,
              owner: request.body.owner,
              repository: request.body.repository,
            },
            'Failed to verify repository before analysis',
          );

          return reply.code(502).send({
            code: 'repository_verification_failed',
            message: getLocalizedReportErrorMessage('repository_verification_failed', language),
          });
        }

        const snapshotLookup = createSnapshotLookup(
          repositoryKey,
          branch,
          projectPath,
          latestCommitDate,
          latestCommitSha,
        );

        const sendReusableAnalysis = async (analysis: ReportAnalysisEntity) => {
          if (analysis.status !== 'failed') {
            const refreshedAnalysis = await repository.touch(analysis.id);

            if (refreshedAnalysis.status === 'completed') {
              return reply.code(200).send({
                id: refreshedAnalysis.id,
                reuseReason: 'completed',
                status: 'completed',
              });
            }

            if (refreshedAnalysis.status === 'queued' || refreshedAnalysis.status === 'running') {
              return reply.code(200).send({
                id: refreshedAnalysis.id,
                reuseReason: 'active',
                status: refreshedAnalysis.status,
              });
            }

            analysis = refreshedAnalysis;
          }

          const retriedAnalysis = await repository.resetForRetry(analysis.id);

          runAnalysis(retriedAnalysis);

          return reply.code(200).send({
            id: retriedAnalysis.id,
            reuseReason: 'retried',
            status: 'queued',
          });
        };

        const reusableAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

        if (reusableAnalysis) {
          return sendReusableAnalysis(reusableAnalysis);
        }

        let analysis: ReportAnalysisEntity;

        try {
          analysis = await repository.create({
            ...request.body,
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
              return sendReusableAnalysis(concurrentAnalysis);
            }
          }

          throw error;
        }

        runAnalysis(analysis);

        return reply.code(201).send({
          id: analysis.id,
          reuseReason: null,
          status: 'queued',
        });
      },
    );

    app.get(
      '/reports',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'listReportAnalyses',
          headers: acceptLanguageHeadersSchema,
          response: {
            200: listReportAnalysesResponseSchema,
          },
        },
      },
      async () => {
        const analyses = await repository.findLatest(reportHistoryLimit);

        return {
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
        };
      },
    );

    app.post(
      '/reports/:id/retry',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'retryReportAnalysis',
          headers: acceptLanguageHeadersSchema,
          params: reportAnalysisParamsSchema,
          response: {
            200: retryReportAnalysisResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);
        const analysis = await repository.findById(request.params.id);

        if (!analysis) {
          return reply.code(404).send({
            message: getLocalizedReportNotFoundMessage(language),
          });
        }

        let retryTarget = analysis;

        if (analysis.status !== 'failed') {
          const refreshedAnalysis = await repository.touch(analysis.id);

          if (refreshedAnalysis.status === 'completed') {
            return reply.code(200).send({
              id: refreshedAnalysis.id,
              retryReason: 'completed',
              status: 'completed',
            });
          }

          if (refreshedAnalysis.status === 'queued' || refreshedAnalysis.status === 'running') {
            return reply.code(200).send({
              id: refreshedAnalysis.id,
              retryReason: 'active',
              status: refreshedAnalysis.status,
            });
          }

          retryTarget = refreshedAnalysis;
        }

        const retriedAnalysis = await repository.resetForRetry(retryTarget.id);

        runAnalysis(retriedAnalysis);

        return reply.code(200).send({
          id: retriedAnalysis.id,
          retryReason: 'retried',
          status: 'queued',
        });
      },
    );

    app.post(
      '/reports/:id/refresh',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'forceRefreshReportAnalysis',
          headers: acceptLanguageHeadersSchema,
          params: reportAnalysisParamsSchema,
          response: {
            200: refreshReportAnalysisResponseSchema,
            201: refreshReportAnalysisResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            409: errorResponseSchema,
            429: errorResponseSchema,
            422: errorResponseSchema,
            502: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);
        const currentAnalysis = await repository.findById(request.params.id);

        if (!currentAnalysis) {
          return reply.code(404).send({
            message: getLocalizedReportNotFoundMessage(language),
          });
        }

        if (currentAnalysis.status !== 'completed' || !currentAnalysis.report) {
          return reply.code(409).send({
            message: getLocalizedReportRefreshUnavailableMessage(language),
          });
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
          );
        } catch (error) {
          if (isReportProjectPathNotFoundError(error)) {
            return reply.code(422).send({
              code: 'project_path_not_found',
              message: getLocalizedReportErrorMessage('project_path_not_found', language),
            });
          }

          if (isGithubApiError(error)) {
            return reply.code(getGithubErrorHttpStatus(error.code)).send({
              code: error.code,
              message: getLocalizedReportErrorMessage(error.code, language),
            });
          }

          request.log.warn(
            {
              error,
              id: currentAnalysis.id,
              owner: currentAnalysis.owner,
              repository: currentAnalysis.repository,
            },
            'Failed to verify repository before report refresh',
          );

          return reply.code(502).send({
            code: 'repository_verification_failed',
            message: getLocalizedReportErrorMessage('repository_verification_failed', language),
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
          return reply.code(200).send({
            id: currentAnalysis.id,
            refreshReason: 'up_to_date',
            status: 'completed',
          });
        }

        const sendRefreshReusableAnalysis = async (analysis: ReportAnalysisEntity) => {
          if (analysis.status === 'failed') {
            const retriedAnalysis = await repository.resetForRetry(analysis.id);

            runAnalysis(retriedAnalysis);

            return reply.code(200).send({
              id: retriedAnalysis.id,
              refreshReason: 'created',
              status: 'queued',
            });
          }

          const refreshedAnalysis = await repository.touch(analysis.id);

          if (refreshedAnalysis.status === 'failed') {
            const retriedAnalysis = await repository.resetForRetry(refreshedAnalysis.id);

            runAnalysis(retriedAnalysis);

            return reply.code(200).send({
              id: retriedAnalysis.id,
              refreshReason: 'created',
              status: 'queued',
            });
          }

          return reply.code(200).send({
            id: refreshedAnalysis.id,
            refreshReason: 'reused',
            status: refreshedAnalysis.status,
          });
        };

        const reusableAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

        if (reusableAnalysis) {
          return sendRefreshReusableAnalysis(reusableAnalysis);
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
              return sendRefreshReusableAnalysis(concurrentAnalysis);
            }
          }

          throw error;
        }

        runAnalysis(newAnalysis);

        return reply.code(201).send({
          id: newAnalysis.id,
          refreshReason: 'created',
          status: 'queued',
        });
      },
    );

    app.get(
      '/reports/:id/comparison',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'getReportComparison',
          headers: acceptLanguageHeadersSchema,
          params: reportAnalysisParamsSchema,
          querystring: getReportComparisonQuerySchema,
          response: {
            200: getReportComparisonResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);
        const analysis = await repository.findById(request.params.id);

        if (!analysis || analysis.status !== 'completed' || !analysis.report) {
          return reply.code(404).send({
            message: getLocalizedReportNotFoundMessage(language),
          });
        }

        const previousAnalysis = request.query.previousId
          ? await repository.findById(request.query.previousId)
          : await repository.findPreviousCompleted(analysis);

        if (
          !previousAnalysis?.report ||
          previousAnalysis.id === analysis.id ||
          previousAnalysis.repositoryKey !== analysis.repositoryKey ||
          previousAnalysis.projectPath !== analysis.projectPath ||
          previousAnalysis.branch !== analysis.branch ||
          previousAnalysis.status !== 'completed'
        ) {
          return {
            status: 'unavailable' as const,
          };
        }

        return buildReportComparison(
          localizeProjectReport(analysis.report, language),
          localizeProjectReport(previousAnalysis.report, language),
        );
      },
    );

    app.get(
      '/reports/:id',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'getReportAnalysis',
          headers: acceptLanguageHeadersSchema,
          params: reportAnalysisParamsSchema,
          response: {
            200: getReportAnalysisResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);
        const analysis = await repository.findById(request.params.id);

        if (!analysis) {
          return reply.code(404).send({
            message: getLocalizedReportNotFoundMessage(language),
          });
        }

        if (analysis.status === 'completed') {
          if (!analysis.report) {
            return reply.code(404).send({
              message: getLocalizedReportNotFoundMessage(language),
            });
          }

          return {
            id: analysis.id,
            report: localizeProjectReport(analysis.report, language),
            status: 'completed' as const,
          };
        }

        if (analysis.status === 'failed') {
          return {
            id: analysis.id,
            status: 'failed' as const,
            errorCode: analysis.errorCode ?? 'analysis_failed',
            errorMessage: getLocalizedReportErrorMessage(
              analysis.errorCode ?? 'analysis_failed',
              language,
            ),
          };
        }

        return {
          id: analysis.id,
          analysis: createReportAnalysisProcessingSummary(analysis),
          status: analysis.status,
        };
      },
    );
  };
};
