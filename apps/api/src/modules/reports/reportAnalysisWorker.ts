import { randomUUID } from 'node:crypto';

import type { ReportAnalyzer } from './githubReportAnalyzer.js';
import { getReportAnalysisFailure } from './githubReportAnalyzer.js';
import { isReportAnalysisLeaseConflictError } from './reportAnalysisRepository.js';
import type { ReportAnalysisEntity, ReportAnalysisRepository } from './reportAnalysisRepository.js';

const recoveryLeaseDurationMs = 5 * 60 * 1000;
const leaseRefreshIntervalMs = Math.floor(recoveryLeaseDurationMs / 3);
const recoveryBatchLimit = 25;

export interface ReportAnalysisLease {
  expiresAt: Date;
  owner: string;
}

interface StartReportAnalysisOptions {
  analysis: ReportAnalysisEntity;
  analyzer: ReportAnalyzer;
  logger: {
    error: (value: unknown, message?: string) => void;
  };
  repository: ReportAnalysisRepository;
  lease?: ReportAnalysisLease;
}

const createLeaseOwner = (analysisId: string) =>
  `analysis-${process.pid}-${analysisId}-${randomUUID()}`;

const createLeaseExpiresAt = (now = new Date()) =>
  new Date(now.getTime() + recoveryLeaseDurationMs);

export const startReportAnalysis = async ({
  analysis,
  analyzer,
  logger,
  repository,
  lease = {
    expiresAt: createLeaseExpiresAt(),
    owner: createLeaseOwner(analysis.id),
  },
}: StartReportAnalysisOptions) => {
  const now = new Date();
  const claimedAnalysis = await repository.claimForProcessing({
    id: analysis.id,
    leaseExpiresAt: lease.expiresAt,
    leaseOwner: lease.owner,
    now,
  });

  if (!claimedAnalysis) {
    return;
  }

  const heartbeat = setInterval(() => {
    void repository.refreshLease({
      id: claimedAnalysis.id,
      leaseExpiresAt: createLeaseExpiresAt(),
      leaseOwner: lease.owner,
    });
  }, leaseRefreshIntervalMs);
  heartbeat.unref?.();

  try {
    const report = await analyzer.analyze(claimedAnalysis);

    await repository.complete(claimedAnalysis.id, report, { leaseOwner: lease.owner });
  } catch (error) {
    if (isReportAnalysisLeaseConflictError(error)) {
      return;
    }

    try {
      await repository.fail(claimedAnalysis.id, getReportAnalysisFailure(error), {
        leaseOwner: lease.owner,
      });
    } catch (failError) {
      if (isReportAnalysisLeaseConflictError(failError)) {
        return;
      }

      throw failError;
    }

    logger.error(
      {
        analysisId: claimedAnalysis.id,
        error,
      },
      'Report analysis failed',
    );
  } finally {
    clearInterval(heartbeat);
  }
};

export const recoverReportAnalyses = async ({
  analyzer,
  logger,
  repository,
}: Omit<StartReportAnalysisOptions, 'analysis'>) => {
  const now = new Date();
  const analyses = await repository.claimRecoverable({
    leaseExpiresAt: createLeaseExpiresAt(now),
    leaseOwnerPrefix: `recovery-${process.pid}`,
    limit: recoveryBatchLimit,
    now,
  });

  for (const analysis of analyses) {
    if (!analysis.leaseOwner || !analysis.leaseExpiresAt) {
      continue;
    }

    void startReportAnalysis({
      analysis,
      analyzer,
      lease: {
        expiresAt: analysis.leaseExpiresAt,
        owner: analysis.leaseOwner,
      },
      logger,
      repository,
    });
  }
};
