import { success, type ReportApplicationResult } from './reportApplicationResponses.js';

import type { ReportAnalyzerRequestContext } from './ports/reportAnalyzer.js';
import type {
  ReportAnalysisEntity,
  ReportAnalysisRepository,
} from './ports/reportAnalysisRepository.js';
import type {
  CreateReportAnalysisResultBody,
  RefreshReportAnalysisResultBody,
} from './reportApplicationServiceTypes.js';

interface ReportAnalysisReuseDeps {
  repository: ReportAnalysisRepository;
  startAnalysis: (analysis: ReportAnalysisEntity, context?: ReportAnalyzerRequestContext) => void;
}

export const createReusableAnalysisResponse = async (
  { repository, startAnalysis }: ReportAnalysisReuseDeps,
  analysis: ReportAnalysisEntity,
  context: ReportAnalyzerRequestContext = {},
): Promise<ReportApplicationResult<CreateReportAnalysisResultBody>> => {
  let reusableAnalysis = analysis;

  if (reusableAnalysis.status !== 'failed') {
    reusableAnalysis = await repository.touch(reusableAnalysis.id);

    if (reusableAnalysis.status === 'completed') {
      return success(200, {
        id: reusableAnalysis.id,
        reuseReason: 'completed',
        status: 'completed',
      });
    }

    if (reusableAnalysis.status === 'queued' || reusableAnalysis.status === 'running') {
      return success(200, {
        id: reusableAnalysis.id,
        reuseReason: 'active',
        status: reusableAnalysis.status,
      });
    }
  }

  const retriedAnalysis = await repository.resetForRetry(reusableAnalysis.id);

  startAnalysis(retriedAnalysis, context);

  return success(200, {
    id: retriedAnalysis.id,
    reuseReason: 'retried',
    status: 'queued',
  });
};

export const createRefreshReusableAnalysisResponse = async (
  { repository, startAnalysis }: ReportAnalysisReuseDeps,
  analysis: ReportAnalysisEntity,
  context: ReportAnalyzerRequestContext = {},
): Promise<ReportApplicationResult<RefreshReportAnalysisResultBody>> => {
  if (analysis.status === 'failed') {
    const retriedAnalysis = await repository.resetForRetry(analysis.id);

    startAnalysis(retriedAnalysis, context);

    return success(200, {
      id: retriedAnalysis.id,
      refreshReason: 'created',
      status: 'queued',
    });
  }

  const refreshedAnalysis = await repository.touch(analysis.id);

  if (refreshedAnalysis.status === 'failed') {
    const retriedAnalysis = await repository.resetForRetry(refreshedAnalysis.id);

    startAnalysis(retriedAnalysis, context);

    return success(200, {
      id: retriedAnalysis.id,
      refreshReason: 'created',
      status: 'queued',
    });
  }

  return success(200, {
    id: refreshedAnalysis.id,
    refreshReason: 'reused',
    status: refreshedAnalysis.status,
  } satisfies RefreshReportAnalysisResultBody);
};
