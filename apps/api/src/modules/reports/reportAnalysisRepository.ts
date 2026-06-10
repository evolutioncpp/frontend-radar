import { Prisma, PrismaClient } from '@prisma/client';

import {
  projectReportSchema,
  type ProjectReport,
  type ReportAnalysisErrorCode,
  type ReportAnalysisStatus,
} from './reportSchemas.js';

import type { CreateReportAnalysisRequest } from './reportSchemas.js';

export interface CreateReportAnalysisRecordInput extends Omit<
  CreateReportAnalysisRequest,
  'projectPath'
> {
  analysisVersion: number;
  latestCommitDate: string | null;
  latestCommitSha: string | null;
  projectPath: string;
  repositoryKey: string;
  snapshotKey: string;
}

export interface ReportAnalysisSnapshotLookup {
  analysisVersion: number;
  projectPath: string;
  repositoryKey: string;
  snapshotKey: string;
}

export interface ReportAnalysisFailure {
  errorCode: ReportAnalysisErrorCode;
  errorMessage: string;
}

export interface ReportAnalysisEntity {
  id: string;
  owner: string;
  repository: string;
  repositoryKey: string;
  projectPath: string;
  snapshotKey: string;
  normalizedUrl: string;
  status: ReportAnalysisStatus;
  latestCommitSha: string | null;
  latestCommitDate: string | null;
  analysisVersion: number;
  report: ProjectReport | null;
  errorCode: ReportAnalysisErrorCode | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportAnalysisRepository {
  complete(id: string, report: ProjectReport): Promise<ReportAnalysisEntity>;
  create(input: CreateReportAnalysisRecordInput): Promise<ReportAnalysisEntity>;
  fail(id: string, failure: ReportAnalysisFailure): Promise<ReportAnalysisEntity>;
  findById(id: string): Promise<ReportAnalysisEntity | null>;
  findLatest(limit: number): Promise<ReportAnalysisEntity[]>;
  findPreviousCompleted(analysis: ReportAnalysisEntity): Promise<ReportAnalysisEntity | null>;
  findRecoverable(): Promise<ReportAnalysisEntity[]>;
  findReusableBySnapshot(
    lookup: ReportAnalysisSnapshotLookup,
  ): Promise<ReportAnalysisEntity | null>;
  resetForRetry(id: string): Promise<ReportAnalysisEntity>;
  touch(id: string): Promise<ReportAnalysisEntity>;
  updateStatus(id: string, status: ReportAnalysisStatus): Promise<ReportAnalysisEntity>;
}

type PrismaReportAnalysis = Awaited<ReturnType<PrismaClient['reportAnalysis']['findUnique']>>;

export class ReportAnalysisAlreadyExistsError extends Error {
  constructor() {
    super('Report analysis already exists for this repository snapshot');
    this.name = 'ReportAnalysisAlreadyExistsError';
  }
}

export const isReportAnalysisAlreadyExistsError = (
  error: unknown,
): error is ReportAnalysisAlreadyExistsError => {
  return error instanceof ReportAnalysisAlreadyExistsError;
};

const parseReportAnalysisErrorCode = (value: string | null): ReportAnalysisErrorCode | null => {
  if (
    value === 'repository_not_found' ||
    value === 'repository_forbidden' ||
    value === 'github_rate_limited' ||
    value === 'github_unavailable' ||
    value === 'project_path_not_found' ||
    value === 'repository_verification_failed' ||
    value === 'analysis_failed'
  ) {
    return value;
  }

  return null;
};

const mapPrismaReportAnalysis = (
  analysis: NonNullable<PrismaReportAnalysis>,
): ReportAnalysisEntity => {
  return {
    id: analysis.id,
    owner: analysis.owner,
    repository: analysis.repository,
    repositoryKey: analysis.repositoryKey,
    projectPath: analysis.projectPath,
    snapshotKey: analysis.snapshotKey,
    normalizedUrl: analysis.normalizedUrl,
    status: analysis.status,
    latestCommitSha: analysis.latestCommitSha,
    latestCommitDate: analysis.latestCommitDate,
    analysisVersion: analysis.analysisVersion,
    report: analysis.report ? projectReportSchema.parse(analysis.report) : null,
    errorCode: parseReportAnalysisErrorCode(analysis.errorCode),
    errorMessage: analysis.errorMessage,
    startedAt: analysis.startedAt,
    completedAt: analysis.completedAt,
    createdAt: analysis.createdAt,
    updatedAt: analysis.updatedAt,
  };
};

const createSnapshotWhere = ({
  analysisVersion,
  projectPath,
  repositoryKey,
  snapshotKey,
}: ReportAnalysisSnapshotLookup): Prisma.ReportAnalysisWhereInput => {
  return {
    analysisVersion,
    projectPath,
    repositoryKey,
    snapshotKey,
  };
};

const getReusableRank = (status: ReportAnalysisStatus) => {
  if (status === 'completed') {
    return 0;
  }

  if (status === 'queued' || status === 'running') {
    return 1;
  }

  return 2;
};

const selectReusableAnalysis = (analyses: ReportAnalysisEntity[]) => {
  return (
    analyses.sort((left, right) => {
      const rankDelta = getReusableRank(left.status) - getReusableRank(right.status);

      if (rankDelta !== 0) {
        return rankDelta;
      }

      return right.updatedAt.getTime() - left.updatedAt.getTime();
    })[0] ?? null
  );
};

export class PrismaReportAnalysisRepository implements ReportAnalysisRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateReportAnalysisRecordInput) {
    try {
      const analysis = await this.prisma.reportAnalysis.create({
        data: input,
      });

      return mapPrismaReportAnalysis(analysis);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ReportAnalysisAlreadyExistsError();
      }

      throw error;
    }
  }

  async findById(id: string) {
    const analysis = await this.prisma.reportAnalysis.findUnique({
      where: {
        id,
      },
    });

    return analysis ? mapPrismaReportAnalysis(analysis) : null;
  }

  async findLatest(limit: number) {
    const analyses = await this.prisma.reportAnalysis.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      where: {
        status: {
          not: 'failed',
        },
      },
    });

    return analyses.map(mapPrismaReportAnalysis);
  }

  async findRecoverable() {
    const analyses = await this.prisma.reportAnalysis.findMany({
      orderBy: {
        updatedAt: 'asc',
      },
      where: {
        status: {
          in: ['queued', 'running'],
        },
      },
    });

    return analyses.map(mapPrismaReportAnalysis);
  }

  async findPreviousCompleted(analysis: ReportAnalysisEntity) {
    const completedBefore = analysis.completedAt ?? analysis.updatedAt;
    const previousAnalysis = await this.prisma.reportAnalysis.findFirst({
      orderBy: {
        completedAt: 'desc',
      },
      where: {
        completedAt: {
          lte: completedBefore,
        },
        id: {
          not: analysis.id,
        },
        repositoryKey: analysis.repositoryKey,
        projectPath: analysis.projectPath,
        status: 'completed',
      },
    });

    return previousAnalysis ? mapPrismaReportAnalysis(previousAnalysis) : null;
  }

  async findReusableBySnapshot(lookup: ReportAnalysisSnapshotLookup) {
    const analyses = await this.prisma.reportAnalysis.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      where: createSnapshotWhere(lookup),
    });

    return selectReusableAnalysis(analyses.map(mapPrismaReportAnalysis));
  }

  async complete(id: string, report: ProjectReport) {
    const analysis = await this.prisma.reportAnalysis.update({
      where: {
        id,
      },
      data: {
        completedAt: new Date(),
        errorCode: null,
        errorMessage: null,
        report: report as unknown as Prisma.InputJsonValue,
        status: 'completed',
      },
    });

    return mapPrismaReportAnalysis(analysis);
  }

  async fail(id: string, failure: ReportAnalysisFailure) {
    const analysis = await this.prisma.reportAnalysis.update({
      where: {
        id,
      },
      data: {
        completedAt: new Date(),
        errorCode: failure.errorCode,
        errorMessage: failure.errorMessage,
        status: 'failed',
      },
    });

    return mapPrismaReportAnalysis(analysis);
  }

  async resetForRetry(id: string) {
    const analysis = await this.prisma.reportAnalysis.update({
      where: {
        id,
      },
      data: {
        completedAt: null,
        errorCode: null,
        errorMessage: null,
        report: Prisma.DbNull,
        startedAt: null,
        status: 'queued',
      },
    });

    return mapPrismaReportAnalysis(analysis);
  }

  async touch(id: string) {
    const analysis = await this.prisma.reportAnalysis.update({
      where: {
        id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return mapPrismaReportAnalysis(analysis);
  }

  async updateStatus(id: string, status: ReportAnalysisStatus) {
    const analysis = await this.prisma.reportAnalysis.update({
      where: {
        id,
      },
      data: {
        startedAt: status === 'running' ? new Date() : undefined,
        status,
      },
    });

    return mapPrismaReportAnalysis(analysis);
  }
}
