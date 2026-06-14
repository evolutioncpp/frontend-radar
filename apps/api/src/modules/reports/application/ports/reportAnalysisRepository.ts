import type {
  CreateReportAnalysisRequest,
  ProjectReport,
  ReportAnalysisErrorCode,
  ReportAnalysisProgressStage,
  ReportAnalysisStatus,
  ReportProjectPathSource,
} from '../../domain/reportSchemas.js';

export interface CreateReportAnalysisRecordInput extends Omit<
  CreateReportAnalysisRequest,
  'branch' | 'projectPath' | 'projectPathSource'
> {
  analysisVersion: number;
  branch: string;
  latestCommitDate: string | null;
  latestCommitSha: string | null;
  latestCommitTitle: string | null;
  projectPath: string;
  projectPathSource: ReportProjectPathSource;
  repositoryKey: string;
  snapshotKey: string;
}

export interface ReportAnalysisSnapshotLookup {
  analysisVersion: number;
  branch: string;
  projectPath: string;
  repositoryKey: string;
  snapshotKey: string;
}

export interface ReportAnalysisFailure {
  errorCode: ReportAnalysisErrorCode;
  errorMessage: string;
}

export interface ClaimRecoverableReportAnalysesInput {
  leaseExpiresAt: Date;
  leaseOwnerPrefix?: string;
  limit: number;
  now: Date;
}

export interface ClaimReportAnalysisForProcessingInput {
  id: string;
  leaseExpiresAt: Date;
  leaseOwner: string;
  now: Date;
}

export interface ReportAnalysisLeaseOptions {
  leaseOwner: string;
}

export interface RefreshReportAnalysisLeaseInput {
  id: string;
  leaseExpiresAt: Date;
  leaseOwner: string;
}

export interface UpdateReportAnalysisProgressInput {
  id: string;
  leaseOwner: string;
  progressStage: ReportAnalysisProgressStage;
  progressUpdatedAt: Date;
}

export interface ReportAnalysisEntity {
  id: string;
  owner: string;
  repository: string;
  repositoryKey: string;
  branch: string;
  projectPath: string;
  projectPathSource: ReportProjectPathSource;
  snapshotKey: string;
  normalizedUrl: string;
  status: ReportAnalysisStatus;
  latestCommitSha: string | null;
  latestCommitDate: string | null;
  latestCommitTitle: string | null;
  analysisVersion: number;
  report: ProjectReport | null;
  errorCode: ReportAnalysisErrorCode | null;
  errorMessage: string | null;
  progressStage: ReportAnalysisProgressStage;
  progressUpdatedAt: Date;
  leaseOwner: string | null;
  leaseExpiresAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportAnalysisRepository {
  claimForProcessing(
    input: ClaimReportAnalysisForProcessingInput,
  ): Promise<ReportAnalysisEntity | null>;
  claimRecoverable(input: ClaimRecoverableReportAnalysesInput): Promise<ReportAnalysisEntity[]>;
  complete(
    id: string,
    report: ProjectReport,
    options: ReportAnalysisLeaseOptions,
  ): Promise<ReportAnalysisEntity>;
  create(input: CreateReportAnalysisRecordInput): Promise<ReportAnalysisEntity>;
  fail(
    id: string,
    failure: ReportAnalysisFailure,
    options: ReportAnalysisLeaseOptions,
  ): Promise<ReportAnalysisEntity>;
  findById(id: string): Promise<ReportAnalysisEntity | null>;
  findLatest(limit: number): Promise<ReportAnalysisEntity[]>;
  findPreviousCompleted(analysis: ReportAnalysisEntity): Promise<ReportAnalysisEntity | null>;
  findReusableBySnapshot(
    lookup: ReportAnalysisSnapshotLookup,
  ): Promise<ReportAnalysisEntity | null>;
  refreshLease(input: RefreshReportAnalysisLeaseInput): Promise<ReportAnalysisEntity | null>;
  resetForRetry(id: string): Promise<ReportAnalysisEntity>;
  touch(id: string): Promise<ReportAnalysisEntity>;
  updateProgress(input: UpdateReportAnalysisProgressInput): Promise<ReportAnalysisEntity | null>;
}

export class ReportAnalysisAlreadyExistsError extends Error {
  constructor() {
    super('Report analysis already exists for this repository snapshot');
    this.name = 'ReportAnalysisAlreadyExistsError';
  }
}

export class ReportAnalysisLeaseConflictError extends Error {
  constructor() {
    super('Report analysis lease is owned by another worker');
    this.name = 'ReportAnalysisLeaseConflictError';
  }
}

export const isReportAnalysisLeaseConflictError = (
  error: unknown,
): error is ReportAnalysisLeaseConflictError => {
  return error instanceof ReportAnalysisLeaseConflictError;
};

export const isReportAnalysisAlreadyExistsError = (
  error: unknown,
): error is ReportAnalysisAlreadyExistsError => {
  return error instanceof ReportAnalysisAlreadyExistsError;
};
