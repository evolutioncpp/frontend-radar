import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getReportPath } from '@/shared/config/routes/appRoutes';

import { useForceRefreshReportAnalysisMutation } from './reportAnalysisApi';

export type ReportForceRefreshNotice = 'upToDate' | 'error' | null;

type ReportForceRefreshNoticeState = {
  reportId: string;
  notice: Exclude<ReportForceRefreshNotice, null>;
} | null;

export const useReportForceRefresh = (reportId?: string) => {
  const navigate = useNavigate();
  const [refreshNoticeState, setRefreshNoticeState] = useState<ReportForceRefreshNoticeState>(null);
  const [forceRefreshReportAnalysis, { isLoading: isRefreshing }] =
    useForceRefreshReportAnalysisMutation();
  const refreshNotice =
    refreshNoticeState && refreshNoticeState.reportId === reportId
      ? refreshNoticeState.notice
      : null;

  const clearRefreshNotice = useCallback(() => {
    setRefreshNoticeState(null);
  }, []);

  const refreshReport = useCallback(() => {
    if (!reportId) {
      return;
    }

    setRefreshNoticeState(null);

    void forceRefreshReportAnalysis({
      id: reportId,
    })
      .unwrap()
      .then((analysis) => {
        if (analysis.refreshReason === 'up_to_date') {
          setRefreshNoticeState({
            notice: 'upToDate',
            reportId,
          });
          return;
        }

        void navigate(getReportPath(analysis.id));
      })
      .catch(() => {
        setRefreshNoticeState({
          notice: 'error',
          reportId,
        });
      });
  }, [forceRefreshReportAnalysis, navigate, reportId]);

  return {
    clearRefreshNotice,
    isRefreshing,
    refreshNotice,
    refreshReport,
  };
};
