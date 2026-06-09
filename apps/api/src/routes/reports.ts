import { getGithubRepositoryKey } from '@frontend-radar/github-repository';

import { startReportAnalysis } from '../modules/reports/reportAnalysisWorker.js';
import {
  createReportAnalysisRequestSchema,
  createReportAnalysisResponseSchema,
  errorResponseSchema,
  getReportAnalysisResponseSchema,
  listReportAnalysesResponseSchema,
  reportAnalysisParamsSchema,
} from '../modules/reports/reportSchemas.js';
import { isGithubApiError } from '../modules/reports/githubReportAnalyzer.js';
import {
  REPORT_ANALYSIS_VERSION,
  reportHistoryLimit,
} from '../modules/reports/reportAnalysisConfig.js';
import { createReportAnalysisSnapshotKey } from '../modules/reports/reportAnalysisSnapshot.js';

import type { ReportAnalyzer } from '../modules/reports/githubReportAnalyzer.js';
import type {
  ReportAnalysisEntity,
  ReportAnalysisSnapshotLookup,
  ReportAnalysisRepository,
} from '../modules/reports/reportAnalysisRepository.js';
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

  return 502;
};

interface ReportRoutesOptions {
  analyzer: ReportAnalyzer;
  repository: ReportAnalysisRepository;
  startAnalysis?: (analysis: ReportAnalysisEntity) => void;
}

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

    app.post(
      '/reports/analyze',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'createReportAnalysis',
          body: createReportAnalysisRequestSchema,
          response: {
            200: createReportAnalysisResponseSchema,
            201: createReportAnalysisResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            429: errorResponseSchema,
            502: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const repositoryKey = getGithubRepositoryKey(request.body.owner, request.body.repository);
        let latestCommitDate: string | null = null;
        let latestCommitSha: string | null = null;

        try {
          const snapshot = await analyzer.getRepositorySnapshot(
            request.body.owner,
            request.body.repository,
          );

          latestCommitDate = snapshot.latestCommitDate;
          latestCommitSha = snapshot.latestCommitSha;
        } catch (error) {
          if (isGithubApiError(error)) {
            return reply.code(getGithubErrorHttpStatus(error.code)).send({
              code: error.code,
              message: error.userMessage,
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
            message: 'GitHub repository could not be verified',
          });
        }

        const snapshotLookup: ReportAnalysisSnapshotLookup = {
          analysisVersion: REPORT_ANALYSIS_VERSION,
          repositoryKey,
          snapshotKey: createReportAnalysisSnapshotKey({
            latestCommitDate,
            latestCommitSha,
          }),
        };

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
            latestCommitDate,
            latestCommitSha,
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
            status: analysis.status,
            latestCommitDate: analysis.latestCommitDate,
            latestCommitSha: analysis.latestCommitSha,
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

    app.get(
      '/reports/:id',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'getReportAnalysis',
          params: reportAnalysisParamsSchema,
          response: {
            200: getReportAnalysisResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const analysis = await repository.findById(request.params.id);

        if (!analysis) {
          return reply.code(404).send({
            message: 'Report analysis not found',
          });
        }

        if (analysis.status === 'completed') {
          if (!analysis.report) {
            return reply.code(404).send({
              message: 'Report analysis not found',
            });
          }

          return {
            id: analysis.id,
            report: analysis.report,
            status: 'completed' as const,
          };
        }

        if (analysis.status === 'failed') {
          return {
            id: analysis.id,
            status: 'failed' as const,
            errorCode: analysis.errorCode ?? 'analysis_failed',
            errorMessage: analysis.errorMessage ?? 'Repository analysis failed.',
          };
        }

        return {
          id: analysis.id,
          status: analysis.status,
        };
      },
    );
  };
};
