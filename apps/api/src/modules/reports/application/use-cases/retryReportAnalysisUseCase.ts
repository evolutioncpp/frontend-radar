import { notFound, success } from '../reportApplicationResponses.js';

import type { ReportAnalyzerRequestContext } from '../ports/reportAnalyzer.js';
import type {
  ReportApplicationServiceOptions,
  RetryReportAnalysisResultBody,
} from '../reportApplicationServiceTypes.js';

export const createRetryReportAnalysisUseCase = ({
  repository,
  startAnalysis,
}: Pick<ReportApplicationServiceOptions, 'repository' | 'startAnalysis'>) => {
  return async (id: string, context: ReportAnalyzerRequestContext = {}) => {
    const analysis = await repository.findById(id);

    if (!analysis) {
      return notFound();
    }

    let retryTarget = analysis;

    if (analysis.status !== 'failed') {
      const refreshedAnalysis = await repository.touch(analysis.id);

      if (refreshedAnalysis.status === 'completed') {
        return success(200, {
          id: refreshedAnalysis.id,
          retryReason: 'completed',
          status: 'completed',
        } satisfies RetryReportAnalysisResultBody);
      }

      if (refreshedAnalysis.status === 'queued' || refreshedAnalysis.status === 'running') {
        return success(200, {
          id: refreshedAnalysis.id,
          retryReason: 'active',
          status: refreshedAnalysis.status,
        } satisfies RetryReportAnalysisResultBody);
      }

      retryTarget = refreshedAnalysis;
    }

    const retriedAnalysis = await repository.resetForRetry(retryTarget.id);

    startAnalysis(retriedAnalysis, context);

    return success(200, {
      id: retriedAnalysis.id,
      retryReason: 'retried',
      status: 'queued',
    } satisfies RetryReportAnalysisResultBody);
  };
};
