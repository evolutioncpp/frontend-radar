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
  analyze(input: ReportAnalysisInput): Promise<ProjectReport>;
  getRepositorySnapshot(
    owner: string,
    repository: string,
    branch?: string | null,
  ): Promise<RepositorySnapshot>;
  listRepositoryBranches(owner: string, repository: string): Promise<RepositoryBranches>;
  resolveProjectPath(
    owner: string,
    repository: string,
    ref: string,
    projectPath?: string | null,
    projectPathSource?: ReportProjectPathSource | null,
  ): Promise<string>;
}

export type ReportAnalyzerApiError = Error & {
  code: ReportAnalysisErrorCode;
  userMessage?: string;
};

const reportAnalysisErrorCodeSet = new Set<string>(reportAnalysisErrorCodes);

export const isReportAnalyzerApiError = (error: unknown): error is ReportAnalyzerApiError => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
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
