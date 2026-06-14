import { buildReportComparison } from '../../domain/reportComparison.js';
import { localizeProjectReport } from '../../localization/reportLocalization.js';
import { getComparisonUnavailableReason } from '../reportApplicationMappers.js';
import { notFound, success } from '../reportApplicationResponses.js';

import type { ReportApplicationServiceOptions } from '../reportApplicationServiceTypes.js';
import type { GetReportComparisonResponse } from '../../domain/reportSchemas.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

interface GetReportComparisonInput {
  id: string;
  language: SupportedLanguage;
  previousId?: string;
}

export const createGetReportComparisonUseCase = ({
  repository,
}: Pick<ReportApplicationServiceOptions, 'repository'>) => {
  return async ({ id, language, previousId }: GetReportComparisonInput) => {
    const analysis = await repository.findById(id);

    if (!analysis || analysis.status !== 'completed' || !analysis.report) {
      return notFound();
    }

    const previousAnalysis = previousId
      ? await repository.findById(previousId)
      : await repository.findPreviousCompleted(analysis);
    const unavailableReason = getComparisonUnavailableReason(analysis, previousAnalysis);

    if (unavailableReason || !previousAnalysis?.report) {
      return success(200, {
        ...(previousId ? { reason: unavailableReason } : {}),
        status: 'unavailable',
      } satisfies GetReportComparisonResponse);
    }

    return success(
      200,
      buildReportComparison(
        localizeProjectReport(analysis.report, language),
        localizeProjectReport(previousAnalysis.report, language),
      ),
    );
  };
};
