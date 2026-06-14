import { randomUUID } from 'node:crypto';

import { Prisma, PrismaClient } from '@prisma/client';

import {
  projectReportSchema,
  type ProjectReport,
  type ReportAnalysisErrorCode,
  type ReportAnalysisProgressStage,
  type ReportAnalysisStatus,
  type ReportProjectPathSource,
} from '../../domain/reportSchemas.js';
import { normalizeEnabledScoreCategories } from '../../domain/reportScoreCategories.js';
import {
  ReportAnalysisAlreadyExistsError,
  ReportAnalysisLeaseConflictError,
  type ClaimRecoverableReportAnalysesInput,
  type ClaimReportAnalysisForProcessingInput,
  type CreateReportAnalysisRecordInput,
  type RefreshReportAnalysisLeaseInput,
  type ReportAnalysisEntity,
  type ReportAnalysisRepository,
  type ReportAnalysisSnapshotLookup,
  type ReportAnalysisFailure,
  type ReportAnalysisLeaseOptions,
  type UpdateReportAnalysisProgressInput,
} from '../../application/ports/reportAnalysisRepository.js';

type PrismaReportAnalysis = Awaited<ReturnType<PrismaClient['reportAnalysis']['findUnique']>>;

const parseReportAnalysisErrorCode = (value: string | null): ReportAnalysisErrorCode | null => {
  if (
    value === 'repository_not_found' ||
    value === 'repository_forbidden' ||
    value === 'github_rate_limited' ||
    value === 'github_unavailable' ||
    value === 'branch_not_found' ||
    value === 'project_path_not_found' ||
    value === 'repository_verification_failed' ||
    value === 'analysis_failed'
  ) {
    return value;
  }

  return null;
};

const parseReportProjectPathSource = (value: string | null): ReportProjectPathSource => {
  if (value === 'url' || value === 'manual' || value === 'autodetect') {
    return value;
  }

  return 'autodetect';
};

const parseReportAnalysisProgressStage = (value: string | null): ReportAnalysisProgressStage => {
  if (
    value === 'queued' ||
    value === 'starting' ||
    value === 'repository_metadata' ||
    value === 'project_detection' ||
    value === 'repository_signals' ||
    value === 'source_scan' ||
    value === 'workflow_analysis' ||
    value === 'scoring' ||
    value === 'report_building'
  ) {
    return value;
  }

  return 'queued';
};

const mapPrismaReportAnalysis = (
  analysis: NonNullable<PrismaReportAnalysis>,
): ReportAnalysisEntity => {
  return {
    id: analysis.id,
    owner: analysis.owner,
    repository: analysis.repository,
    repositoryKey: analysis.repositoryKey,
    branch: analysis.branch,
    projectPath: analysis.projectPath,
    projectPathSource: parseReportProjectPathSource(analysis.projectPathSource),
    enabledScoreCategories: normalizeEnabledScoreCategories(analysis.scoreCategoriesKey.split(',')),
    isHistoryVisible: analysis.isHistoryVisible,
    scoreCategoriesKey: analysis.scoreCategoriesKey,
    snapshotKey: analysis.snapshotKey,
    normalizedUrl: analysis.normalizedUrl,
    status: analysis.status,
    latestCommitSha: analysis.latestCommitSha,
    latestCommitDate: analysis.latestCommitDate,
    latestCommitTitle: analysis.latestCommitTitle,
    analysisVersion: analysis.analysisVersion,
    report: analysis.report ? projectReportSchema.parse(analysis.report) : null,
    errorCode: parseReportAnalysisErrorCode(analysis.errorCode),
    errorMessage: analysis.errorMessage,
    progressStage: parseReportAnalysisProgressStage(analysis.progressStage),
    progressUpdatedAt: analysis.progressUpdatedAt,
    leaseOwner: analysis.leaseOwner,
    leaseExpiresAt: analysis.leaseExpiresAt,
    startedAt: analysis.startedAt,
    completedAt: analysis.completedAt,
    createdAt: analysis.createdAt,
    updatedAt: analysis.updatedAt,
  };
};

const createSnapshotWhere = ({
  analysisVersion,
  branch,
  isHistoryVisible,
  projectPath,
  repositoryKey,
  scoreCategoriesKey,
  snapshotKey,
}: ReportAnalysisSnapshotLookup): Prisma.ReportAnalysisWhereInput => {
  return {
    analysisVersion,
    branch,
    isHistoryVisible,
    projectPath,
    repositoryKey,
    scoreCategoriesKey,
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
        isHistoryVisible: true,
        status: {
          not: 'failed',
        },
      },
    });

    return analyses.map(mapPrismaReportAnalysis);
  }

  async claimForProcessing({
    id,
    leaseExpiresAt,
    leaseOwner,
    now,
  }: ClaimReportAnalysisForProcessingInput) {
    const claimResult = await this.prisma.reportAnalysis.updateMany({
      data: {
        leaseExpiresAt,
        leaseOwner,
        progressStage: 'starting',
        progressUpdatedAt: now,
        startedAt: now,
        status: 'running',
      },
      where: {
        id,
        OR: [
          {
            leaseExpiresAt: null,
          },
          {
            leaseExpiresAt: {
              lte: now,
            },
          },
          {
            leaseOwner,
          },
        ],
        status: {
          in: ['queued', 'running'],
        },
      },
    });

    if (claimResult.count === 0) {
      return null;
    }

    const claimedAnalysis = await this.prisma.reportAnalysis.findUnique({
      where: {
        id,
      },
    });

    return claimedAnalysis ? mapPrismaReportAnalysis(claimedAnalysis) : null;
  }

  async claimRecoverable({
    leaseExpiresAt,
    leaseOwnerPrefix = `recovery-${process.pid}`,
    limit,
    now,
  }: ClaimRecoverableReportAnalysesInput) {
    const candidates = await this.prisma.reportAnalysis.findMany({
      orderBy: {
        updatedAt: 'asc',
      },
      take: limit,
      where: {
        OR: [
          {
            leaseExpiresAt: null,
          },
          {
            leaseExpiresAt: {
              lte: now,
            },
          },
        ],
        status: {
          in: ['queued', 'running'],
        },
      },
    });
    const claimedAnalyses: ReportAnalysisEntity[] = [];

    for (const candidate of candidates) {
      const leaseOwner = `${leaseOwnerPrefix}-${candidate.id}-${randomUUID()}`;
      const claimResult = await this.prisma.reportAnalysis.updateMany({
        data: {
          leaseExpiresAt,
          leaseOwner,
        },
        where: {
          id: candidate.id,
          OR: [
            {
              leaseExpiresAt: null,
            },
            {
              leaseExpiresAt: {
                lte: now,
              },
            },
          ],
          status: {
            in: ['queued', 'running'],
          },
        },
      });

      if (claimResult.count === 0) {
        continue;
      }

      const claimedAnalysis = await this.prisma.reportAnalysis.findUnique({
        where: {
          id: candidate.id,
        },
      });

      if (claimedAnalysis) {
        claimedAnalyses.push(mapPrismaReportAnalysis(claimedAnalysis));
      }
    }

    return claimedAnalyses;
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
        branch: analysis.branch,
        scoreCategoriesKey: analysis.scoreCategoriesKey,
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

  async complete(id: string, report: ProjectReport, options: ReportAnalysisLeaseOptions) {
    const updateResult = await this.prisma.reportAnalysis.updateMany({
      where: {
        id,
        leaseOwner: options.leaseOwner,
      },
      data: {
        completedAt: new Date(),
        errorCode: null,
        errorMessage: null,
        leaseExpiresAt: null,
        leaseOwner: null,
        progressStage: 'report_building',
        progressUpdatedAt: new Date(),
        report: report as unknown as Prisma.InputJsonValue,
        status: 'completed',
      },
    });

    if (updateResult.count === 0) {
      throw new ReportAnalysisLeaseConflictError();
    }

    const analysis = await this.prisma.reportAnalysis.findUnique({
      where: {
        id,
      },
    });

    if (!analysis) {
      throw new ReportAnalysisLeaseConflictError();
    }

    return mapPrismaReportAnalysis(analysis);
  }

  async fail(id: string, failure: ReportAnalysisFailure, options: ReportAnalysisLeaseOptions) {
    const updateResult = await this.prisma.reportAnalysis.updateMany({
      where: {
        id,
        leaseOwner: options.leaseOwner,
      },
      data: {
        completedAt: new Date(),
        errorCode: failure.errorCode,
        errorMessage: failure.errorMessage,
        leaseExpiresAt: null,
        leaseOwner: null,
        status: 'failed',
      },
    });

    if (updateResult.count === 0) {
      throw new ReportAnalysisLeaseConflictError();
    }

    const analysis = await this.prisma.reportAnalysis.findUnique({
      where: {
        id,
      },
    });

    if (!analysis) {
      throw new ReportAnalysisLeaseConflictError();
    }

    return mapPrismaReportAnalysis(analysis);
  }

  async refreshLease({ id, leaseExpiresAt, leaseOwner }: RefreshReportAnalysisLeaseInput) {
    const updateResult = await this.prisma.reportAnalysis.updateMany({
      data: {
        leaseExpiresAt,
      },
      where: {
        id,
        leaseOwner,
        status: 'running',
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    const analysis = await this.prisma.reportAnalysis.findUnique({
      where: {
        id,
      },
    });

    return analysis ? mapPrismaReportAnalysis(analysis) : null;
  }

  async updateProgress({
    id,
    leaseOwner,
    progressStage,
    progressUpdatedAt,
  }: UpdateReportAnalysisProgressInput) {
    const updateResult = await this.prisma.reportAnalysis.updateMany({
      data: {
        progressStage,
        progressUpdatedAt,
      },
      where: {
        id,
        leaseOwner,
        status: 'running',
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    const analysis = await this.prisma.reportAnalysis.findUnique({
      where: {
        id,
      },
    });

    return analysis ? mapPrismaReportAnalysis(analysis) : null;
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
        leaseExpiresAt: null,
        leaseOwner: null,
        progressStage: 'queued',
        progressUpdatedAt: new Date(),
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
}
