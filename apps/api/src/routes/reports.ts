import {
  createReportAnalysisRequestSchema,
  createReportAnalysisResponseSchema,
  acceptLanguageHeadersSchema,
  errorResponseSchema,
  getReportComparisonQuerySchema,
  getReportComparisonResponseSchema,
  getReportAnalysisResponseSchema,
  githubTokenHeadersSchema,
  listRepositoryBranchesResponseSchema,
  listReportAnalysesResponseSchema,
  reportAnalysisParamsSchema,
  repositoryBranchesParamsSchema,
  refreshReportAnalysisResponseSchema,
  retryReportAnalysisResponseSchema,
  validateGithubTokenResponseSchema,
} from '../modules/reports/domain/reportSchemas.js';
import { getReportLanguage } from '../modules/reports/domain/reportLanguage.js';
import {
  getLocalizedReportErrorMessage,
  getLocalizedReportNotFoundMessage,
  getLocalizedReportRefreshUnavailableMessage,
} from '../modules/reports/localization/reportLocalization.js';

import type {
  ReportApplicationError,
  ReportApplicationResult,
  ReportApplicationService,
} from '../modules/reports/application/reportApplicationService.js';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { FastifyReply, FastifyRequest } from 'fastify';

interface ReportRoutesOptions {
  reports: ReportApplicationService;
}

const sendApplicationError = (
  error: ReportApplicationError,
  language: ReturnType<typeof getReportLanguage>,
  reply: FastifyReply,
) => {
  if (error.reason === 'not_found') {
    return reply.code(error.statusCode).send({
      message: getLocalizedReportNotFoundMessage(language),
    });
  }

  if (error.reason === 'refresh_unavailable') {
    return reply.code(error.statusCode).send({
      message: getLocalizedReportRefreshUnavailableMessage(language),
    });
  }

  return reply.code(error.statusCode).send({
    code: error.code,
    message: getLocalizedReportErrorMessage(error.code, language),
  });
};

const logApplicationWarning = (request: FastifyRequest, error: ReportApplicationError) => {
  if (error.reason !== 'localized_code' || !error.warning) {
    return;
  }

  request.log.warn(error.warning.context, error.warning.message);
};

const getGithubTokenFromHeaders = (headers: FastifyRequest['headers']) => {
  const rawValue = headers['x-github-token'];
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  if (typeof value !== 'string') {
    return undefined;
  }

  return value.trim() || undefined;
};

const getRequestContext = (request: FastifyRequest) => ({
  githubToken: getGithubTokenFromHeaders(request.headers),
});

const sendResult = <TBody>(
  result: ReportApplicationResult<TBody>,
  language: ReturnType<typeof getReportLanguage>,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (result.type === 'error') {
    logApplicationWarning(request, result.error);
    return sendApplicationError(result.error, language, reply);
  }

  return reply.code(result.statusCode).send(result.body);
};

export const createReportRoutes = ({ reports }: ReportRoutesOptions): FastifyPluginAsyncZod => {
  return async (app) => {
    app.get(
      '/github/token/validate',
      {
        schema: {
          hide: true,
          tags: ['GitHub'],
          operationId: 'validateGithubToken',
          headers: githubTokenHeadersSchema,
          response: {
            200: validateGithubTokenResponseSchema,
            403: errorResponseSchema,
            429: errorResponseSchema,
            502: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);
        const result = await reports.validateGithubToken(getRequestContext(request));

        return sendResult(result, language, request, reply);
      },
    );

    app.get(
      '/repositories/:owner/:repository/branches',
      {
        schema: {
          tags: ['Repositories'],
          operationId: 'listRepositoryBranches',
          headers: githubTokenHeadersSchema,
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
        const result = await reports.listRepositoryBranches(
          request.params.owner,
          request.params.repository,
          getRequestContext(request),
        );

        return sendResult(result, language, request, reply);
      },
    );

    app.post(
      '/reports/analyze',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'createReportAnalysis',
          body: createReportAnalysisRequestSchema,
          headers: githubTokenHeadersSchema,
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
        const result = await reports.createReportAnalysis(request.body, getRequestContext(request));

        return sendResult(result, language, request, reply);
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
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);
        const result = await reports.listReportAnalyses();

        return sendResult(result, language, request, reply);
      },
    );

    app.post(
      '/reports/:id/retry',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'retryReportAnalysis',
          headers: githubTokenHeadersSchema,
          params: reportAnalysisParamsSchema,
          response: {
            200: retryReportAnalysisResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const language = getReportLanguage(request.headers['accept-language']);
        const result = await reports.retryReportAnalysis(
          request.params.id,
          getRequestContext(request),
        );

        return sendResult(result, language, request, reply);
      },
    );

    app.post(
      '/reports/:id/refresh',
      {
        schema: {
          tags: ['Reports'],
          operationId: 'forceRefreshReportAnalysis',
          headers: githubTokenHeadersSchema,
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
        const result = await reports.refreshReportAnalysis(
          request.params.id,
          getRequestContext(request),
        );

        return sendResult(result, language, request, reply);
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
        const result = await reports.getReportComparison({
          id: request.params.id,
          language,
          previousId: request.query.previousId,
        });

        return sendResult(result, language, request, reply);
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
        const result = await reports.getReportAnalysis(request.params.id, language);

        return sendResult(result, language, request, reply);
      },
    );
  };
};
