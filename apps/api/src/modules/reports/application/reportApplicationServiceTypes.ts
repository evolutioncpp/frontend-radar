import type { ReportAnalyzer, ReportAnalyzerRequestContext } from './ports/reportAnalyzer.js';
import type {
  ReportAnalysisEntity,
  ReportAnalysisRepository,
} from './ports/reportAnalysisRepository.js';
import type { ReportApplicationResult } from './reportApplicationResponses.js';
import type {
  CreateReportAnalysisRequest,
  CreateReportAnalysisResponse,
  GetReportAnalysisResponse,
  GetReportComparisonResponse,
  ListReportAnalysesResponse,
  ListRepositoryBranchesResponse,
  RefreshReportAnalysisResponse,
  RetryReportAnalysisResponse,
  ValidateGithubTokenResponse,
} from '../domain/reportSchemas.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export type CreateReportAnalysisResultBody = CreateReportAnalysisResponse;
export type RetryReportAnalysisResultBody = RetryReportAnalysisResponse;
export type RefreshReportAnalysisResultBody = RefreshReportAnalysisResponse;
export type GetReportAnalysisResultBody = GetReportAnalysisResponse;
export type ValidateGithubTokenResultBody = ValidateGithubTokenResponse;

export interface ReportApplicationServiceOptions {
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
