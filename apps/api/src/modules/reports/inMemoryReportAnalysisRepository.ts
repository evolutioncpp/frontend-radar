import { randomUUID } from 'node:crypto';

import type {
  CreateReportAnalysisRecordInput,
  ReportAnalysisEntity,
  ReportAnalysisFailure,
  ReportAnalysisRepository,
  ReportAnalysisSnapshotLookup,
} from './reportAnalysisRepository.js';
import type { ProjectReport, ReportAnalysisStatus } from './reportSchemas.js';

const getReusableRank = (status: ReportAnalysisStatus) => {
  if (status === 'completed') {
    return 0;
  }

  if (status === 'queued' || status === 'running') {
    return 1;
  }

  return 2;
};

const matchesSnapshot = (
  analysis: ReportAnalysisEntity,
  { analysisVersion, projectPath, repositoryKey, snapshotKey }: ReportAnalysisSnapshotLookup,
) => {
  if (
    analysis.repositoryKey !== repositoryKey ||
    analysis.projectPath !== projectPath ||
    analysis.analysisVersion !== analysisVersion
  ) {
    return false;
  }

  return analysis.snapshotKey === snapshotKey;
};

export class InMemoryReportAnalysisRepository implements ReportAnalysisRepository {
  private readonly analyses = new Map<string, ReportAnalysisEntity>();

  async create(input: CreateReportAnalysisRecordInput) {
    const now = new Date();
    const analysis: ReportAnalysisEntity = {
      ...input,
      id: randomUUID(),
      status: 'queued',
      report: null,
      errorCode: null,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.analyses.set(analysis.id, analysis);

    return analysis;
  }

  async findById(id: string) {
    return this.analyses.get(id) ?? null;
  }

  async findLatest(limit: number) {
    return Array.from(this.analyses.values())
      .filter((analysis) => analysis.status !== 'failed')
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
      .slice(0, limit);
  }

  async findRecoverable() {
    return Array.from(this.analyses.values())
      .filter((analysis) => analysis.status === 'queued' || analysis.status === 'running')
      .sort((left, right) => left.updatedAt.getTime() - right.updatedAt.getTime());
  }

  async findPreviousCompleted(analysis: ReportAnalysisEntity) {
    const completedBefore = analysis.completedAt ?? analysis.updatedAt;

    return (
      Array.from(this.analyses.values())
        .filter(
          (candidate) =>
            candidate.id !== analysis.id &&
            candidate.repositoryKey === analysis.repositoryKey &&
            candidate.projectPath === analysis.projectPath &&
            candidate.status === 'completed' &&
            candidate.completedAt !== null &&
            candidate.completedAt.getTime() <= completedBefore.getTime(),
        )
        .sort((left, right) => {
          const leftCompletedAt = left.completedAt?.getTime() ?? 0;
          const rightCompletedAt = right.completedAt?.getTime() ?? 0;

          return rightCompletedAt - leftCompletedAt;
        })[0] ?? null
    );
  }

  async findReusableBySnapshot(lookup: ReportAnalysisSnapshotLookup) {
    return (
      Array.from(this.analyses.values())
        .filter((analysis) => matchesSnapshot(analysis, lookup))
        .sort((left, right) => {
          const rankDelta = getReusableRank(left.status) - getReusableRank(right.status);

          if (rankDelta !== 0) {
            return rankDelta;
          }

          return right.updatedAt.getTime() - left.updatedAt.getTime();
        })[0] ?? null
    );
  }

  async complete(id: string, report: ProjectReport) {
    return this.update(id, {
      completedAt: new Date(),
      errorCode: null,
      errorMessage: null,
      report,
      status: 'completed',
    });
  }

  async fail(id: string, failure: ReportAnalysisFailure) {
    return this.update(id, {
      completedAt: new Date(),
      errorCode: failure.errorCode,
      errorMessage: failure.errorMessage,
      status: 'failed',
    });
  }

  async resetForRetry(id: string) {
    return this.update(id, {
      completedAt: null,
      errorCode: null,
      errorMessage: null,
      report: null,
      startedAt: null,
      status: 'queued',
    });
  }

  async touch(id: string) {
    return this.update(id, {});
  }

  async updateStatus(id: string, status: ReportAnalysisStatus) {
    return this.update(id, {
      startedAt: status === 'running' ? new Date() : undefined,
      status,
    });
  }

  private update(
    id: string,
    values: Partial<
      Pick<
        ReportAnalysisEntity,
        'completedAt' | 'errorCode' | 'errorMessage' | 'report' | 'startedAt' | 'status'
      >
    >,
  ) {
    const analysis = this.analyses.get(id);

    if (!analysis) {
      throw new Error(`Report analysis ${id} not found`);
    }

    const updatedAnalysis: ReportAnalysisEntity = {
      ...analysis,
      ...values,
      updatedAt: new Date(),
    };

    this.analyses.set(id, updatedAnalysis);

    return updatedAnalysis;
  }
}
