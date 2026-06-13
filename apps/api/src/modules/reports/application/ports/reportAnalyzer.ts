import { reportAnalysisErrorCodes } from '../../domain/reportSchemas.js';

import type {
  CreateReportAnalysisRequest,
  ProjectReport,
  ReportAnalysisErrorCode,
  ReportProjectPathSource,
} from '../../domain/reportSchemas.js';
import type { ReportAnalysisFailure } from './reportAnalysisRepository.js';

export interface RepositorySnapshot {
  branch: string;
  defaultBranch?: string;
  latestCommitDate: string | null;
  latestCommitSha: string | null;
  latestCommitTitle: string | null;
}

export interface RepositoryBranches {
  branches: Array<{
    isDefault: boolean;
    name: string;
  }>;
  defaultBranch: string;
  isTruncated: boolean;
}

export interface ReportAnalyzerRequestContext {
  githubToken?: string;
}

export type ReportAnalysisInput = Omit<
  CreateReportAnalysisRequest,
  'branch' | 'projectPath' | 'projectPathSource'
> & {
  id: string;
  branch: string;
  createdAt: Date;
  latestCommitDate: string | null;
  latestCommitSha: string | null;
  latestCommitTitle: string | null;
  projectPath: string;
  projectPathSource: ReportProjectPathSource;
};

export interface ReportAnalyzer {
  analyze(
    input: ReportAnalysisInput,
    context?: ReportAnalyzerRequestContext,
  ): Promise<ProjectReport>;
  getRepositorySnapshot(
    owner: string,
    repository: string,
    branch?: string | null,
    context?: ReportAnalyzerRequestContext,
  ): Promise<RepositorySnapshot>;
  listRepositoryBranches(
    owner: string,
    repository: string,
    context?: ReportAnalyzerRequestContext,
  ): Promise<RepositoryBranches>;
  resolveProjectPath(
    owner: string,
    repository: string,
    ref: string,
    projectPath?: string | null,
    projectPathSource?: ReportProjectPathSource | null,
    context?: ReportAnalyzerRequestContext,
  ): Promise<string>;
  validateGithubToken(context: ReportAnalyzerRequestContext): Promise<void>;
}

export const reportAnalyzerApiErrorBrand: unique symbol = Symbol(
  'frontend-radar.reportAnalyzerApiError',
);

export type ReportAnalyzerApiError = Error & {
  readonly [reportAnalyzerApiErrorBrand]: true;
  code: ReportAnalysisErrorCode;
  userMessage?: string;
};

const reportAnalysisErrorCodeSet = new Set<string>(reportAnalysisErrorCodes);

export const isReportAnalyzerApiError = (error: unknown): error is ReportAnalyzerApiError => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }

  if (
    (error as { [reportAnalyzerApiErrorBrand]?: unknown })[reportAnalyzerApiErrorBrand] !== true
  ) {
    return false;
  }

  return reportAnalysisErrorCodeSet.has(String((error as { code: unknown }).code));
};

export class ReportProjectPathNotFoundError extends Error {
  constructor(projectPath: string) {
    super(`Frontend project package.json was not found at ${projectPath}`);
    this.name = 'ReportProjectPathNotFoundError';
  }
}

export const isReportProjectPathNotFoundError = (
  error: unknown,
): error is ReportProjectPathNotFoundError => {
  return error instanceof ReportProjectPathNotFoundError;
};

export const getReportAnalysisFailure = (error: unknown): ReportAnalysisFailure => {
  if (isReportAnalyzerApiError(error)) {
    return {
      errorCode: error.code,
      errorMessage: error.userMessage ?? error.message,
    };
  }

  return {
    errorCode: 'analysis_failed',
    errorMessage: 'Repository analysis failed.',
  };
};
