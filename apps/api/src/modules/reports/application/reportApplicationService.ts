import { createCreateReportAnalysisUseCase } from './use-cases/createReportAnalysisUseCase.js';
import { createGetReportAnalysisUseCase } from './use-cases/getReportAnalysisUseCase.js';
import { createGetReportComparisonUseCase } from './use-cases/getReportComparisonUseCase.js';
import { createListReportAnalysesUseCase } from './use-cases/listReportAnalysesUseCase.js';
import { createListRepositoryBranchesUseCase } from './use-cases/listRepositoryBranchesUseCase.js';
import { createRefreshReportAnalysisUseCase } from './use-cases/refreshReportAnalysisUseCase.js';
import { createRetryReportAnalysisUseCase } from './use-cases/retryReportAnalysisUseCase.js';
import { createValidateGithubTokenUseCase } from './use-cases/validateGithubTokenUseCase.js';

import type {
  CreateReportAnalysisResultBody,
  GetReportAnalysisResultBody,
  ReportApplicationService,
  ReportApplicationServiceOptions,
  RefreshReportAnalysisResultBody,
  RetryReportAnalysisResultBody,
  ValidateGithubTokenResultBody,
} from './reportApplicationServiceTypes.js';

export type {
  CreateReportAnalysisResultBody,
  GetReportAnalysisResultBody,
  ReportApplicationService,
  RefreshReportAnalysisResultBody,
  RetryReportAnalysisResultBody,
  ValidateGithubTokenResultBody,
};

export const createReportApplicationService = (
  options: ReportApplicationServiceOptions,
): ReportApplicationService => ({
  createReportAnalysis: createCreateReportAnalysisUseCase(options),
  getReportAnalysis: createGetReportAnalysisUseCase(options),
  getReportComparison: createGetReportComparisonUseCase(options),
  listReportAnalyses: createListReportAnalysesUseCase(options),
  listRepositoryBranches: createListRepositoryBranchesUseCase(options),
  refreshReportAnalysis: createRefreshReportAnalysisUseCase(options),
  retryReportAnalysis: createRetryReportAnalysisUseCase(options),
  validateGithubToken: createValidateGithubTokenUseCase(options),
});
