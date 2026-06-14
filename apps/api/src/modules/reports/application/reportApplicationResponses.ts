import type { ReportAnalysisErrorCode } from '../domain/reportSchemas.js';

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

export const success = <TBody>(
  statusCode: number,
  body: TBody,
): ReportApplicationResult<TBody> => ({
  body,
  statusCode,
  type: 'success',
});

export const localizedError = (
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

export const notFound = (): ReportApplicationResult<never> => ({
  error: {
    reason: 'not_found',
    statusCode: 404,
  },
  type: 'error',
});

export const refreshUnavailable = (): ReportApplicationResult<never> => ({
  error: {
    reason: 'refresh_unavailable',
    statusCode: 409,
  },
  type: 'error',
});

export const createVerificationFailedError = (
  warning: ReportApplicationWarning,
): ReportApplicationResult<never> => {
  return localizedError('repository_verification_failed', 502, warning);
};
