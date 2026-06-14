import { isReportAnalyzerApiError } from '../ports/reportAnalyzer.js';
import {
  createVerificationFailedError,
  localizedError,
  success,
} from '../reportApplicationResponses.js';

import type { ReportAnalyzerRequestContext } from '../ports/reportAnalyzer.js';
import type { ReportApplicationServiceOptions } from '../reportApplicationServiceTypes.js';

export const createListRepositoryBranchesUseCase = ({
  analyzer,
}: Pick<ReportApplicationServiceOptions, 'analyzer'>) => {
  return async (
    owner: string,
    repositoryName: string,
    context: ReportAnalyzerRequestContext = {},
  ) => {
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
  };
};
