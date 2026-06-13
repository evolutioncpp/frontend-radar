import { randomUUID } from 'node:crypto';

import { env } from '../../../config/env.js';
import {
  getReportAnalysisFailure,
  type ReportAnalyzer,
  type ReportAnalyzerRequestContext,
} from './ports/reportAnalyzer.js';
import { isReportAnalysisLeaseConflictError } from './ports/reportAnalysisRepository.js';
import type {
  ReportAnalysisEntity,
  ReportAnalysisRepository,
} from './ports/reportAnalysisRepository.js';

const recoveryLeaseDurationMs = env.REPORT_ANALYSIS_LEASE_TTL_MS;
const leaseRefreshIntervalMs = Math.floor(recoveryLeaseDurationMs / 3);
const recoveryBatchLimit = env.REPORT_ANALYSIS_RECOVERY_BATCH_LIMIT;

export interface ReportAnalysisLease {
  expiresAt: Date;
  owner: string;
}

interface StartReportAnalysisOptions {
  analysis: ReportAnalysisEntity;
  analyzer: ReportAnalyzer;
  logger: {
    error: (value: unknown, message?: string) => void;
    warn: (value: unknown, message?: string) => void;
  };
  repository: ReportAnalysisRepository;
  lease?: ReportAnalysisLease;
  context?: ReportAnalyzerRequestContext;
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
  context = {},
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

  let isFinished = false;
  let isLeaseLost = false;
  const heartbeat = setInterval(() => {
    void repository
      .refreshLease({
        id: claimedAnalysis.id,
        leaseExpiresAt: createLeaseExpiresAt(),
        leaseOwner: lease.owner,
      })
      .then((refreshedAnalysis) => {
        if (refreshedAnalysis || isFinished) {
          return;
        }

        isLeaseLost = true;
        clearInterval(heartbeat);
        logger.warn(
          {
            analysisId: claimedAnalysis.id,
            leaseOwner: lease.owner,
          },
          'Report analysis lease was lost',
        );
      })
      .catch((error: unknown) => {
        if (isFinished) {
          return;
        }

        logger.warn(
          {
            analysisId: claimedAnalysis.id,
            error,
            leaseOwner: lease.owner,
          },
          'Report analysis lease refresh failed',
        );
      });
  }, leaseRefreshIntervalMs);
  heartbeat.unref?.();

  try {
    const report = await analyzer.analyze(claimedAnalysis, context);

    if (isLeaseLost) {
      return;
    }

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
    isFinished = true;
    clearInterval(heartbeat);
  }
};

export const startReportAnalysisSafely = (options: StartReportAnalysisOptions) => {
  void startReportAnalysis(options).catch((error: unknown) => {
    options.logger.error(
      {
        analysisId: options.analysis.id,
        error,
      },
      'Report analysis worker crashed',
    );
  });
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

    startReportAnalysisSafely({
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
