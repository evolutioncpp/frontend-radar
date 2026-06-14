import { isReportAnalyzerApiError } from '../ports/reportAnalyzer.js';
import {
  createVerificationFailedError,
  localizedError,
  success,
} from '../reportApplicationResponses.js';

import type { ReportAnalyzerRequestContext } from '../ports/reportAnalyzer.js';
import type {
  ReportApplicationServiceOptions,
  ValidateGithubTokenResultBody,
} from '../reportApplicationServiceTypes.js';

export const createValidateGithubTokenUseCase = ({
  analyzer,
}: Pick<ReportApplicationServiceOptions, 'analyzer'>) => {
  return async (context: ReportAnalyzerRequestContext) => {
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
  };
};
