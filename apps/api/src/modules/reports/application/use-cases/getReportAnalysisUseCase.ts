import {
  getLocalizedReportErrorMessage,
  localizeProjectReport,
} from '../../localization/reportLocalization.js';
import { createReportAnalysisProcessingSummary } from '../reportApplicationMappers.js';
import { notFound, success } from '../reportApplicationResponses.js';

import type {
  GetReportAnalysisResultBody,
  ReportApplicationServiceOptions,
} from '../reportApplicationServiceTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const createGetReportAnalysisUseCase = ({
  repository,
}: Pick<ReportApplicationServiceOptions, 'repository'>) => {
  return async (id: string, language: SupportedLanguage) => {
    const analysis = await repository.findById(id);

    if (!analysis) {
      return notFound();
    }

    if (analysis.status === 'completed') {
      if (!analysis.report) {
        return notFound();
      }

      return success(200, {
        id: analysis.id,
        report: localizeProjectReport(analysis.report, language),
        status: 'completed',
      } satisfies GetReportAnalysisResultBody);
    }

    if (analysis.status === 'failed') {
      const errorCode = analysis.errorCode ?? 'analysis_failed';

      return success(200, {
        id: analysis.id,
        status: 'failed',
        errorCode,
        errorMessage: getLocalizedReportErrorMessage(errorCode, language),
      } satisfies GetReportAnalysisResultBody);
    }

    return success(200, {
      id: analysis.id,
      analysis: createReportAnalysisProcessingSummary(analysis),
      status: analysis.status,
    } satisfies GetReportAnalysisResultBody);
  };
};
