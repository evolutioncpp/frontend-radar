import { formatDate } from '@/shared/lib/format-date';

import type { ListReportAnalysesApiResponse } from './reportApi';

export type ReportAnalysisStatus = 'queued' | 'running' | 'completed' | 'failed';

type ReportHistoryItem = ListReportAnalysesApiResponse['items'][number];

export const isReportProcessing = (status: ReportAnalysisStatus) => {
  return status === 'queued' || status === 'running';
};

export const isReportTerminal = (status: ReportAnalysisStatus) => {
  return status === 'completed' || status === 'failed';
};

export const getReportHistoryItemViewModel = (item: ReportHistoryItem, language: string) => {
  return {
    activityAt: item.updatedAt,
    activityLabel: formatDate(item.updatedAt, language),
    checksCount: item.checksCount ?? 0,
    id: item.id,
    metricsCount: item.metricsCount ?? 0,
    recommendationsCount: item.recommendationsCount ?? 0,
    repositoryName: `${item.owner}/${item.repository}`,
    score: item.score,
    status: item.status,
  };
};
