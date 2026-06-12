import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';

import { getApiErrorStatus, isApiTransportErrorStatus } from '@/shared/api/apiErrors';

import { useGetReportAnalysisQuery } from './reportApi';
import { isReportProcessing } from './reportSelectors';

import type {
  FailedReportAnalysisResponse,
  ProcessingReportAnalysisResponse,
  ProjectReport,
} from './types';

export type ProjectReportProcessingAnalysis = ProcessingReportAnalysisResponse['analysis'];

export type ProjectReportState =
  | {
      status: 'loading';
    }
  | {
      status: 'processing';
      analysisStatus: 'queued' | 'running';
      analysis: ProjectReportProcessingAnalysis;
    }
  | {
      status: 'ready';
      report: ProjectReport;
    }
  | {
      status: 'notFound';
    }
  | {
      status: 'error';
    }
  | {
      status: 'serviceUnavailable';
    }
  | {
      status: 'failed';
      errorCode: FailedReportAnalysisResponse['errorCode'];
      errorMessage: FailedReportAnalysisResponse['errorMessage'];
      id: FailedReportAnalysisResponse['id'];
    };

export const useProjectReport = (reportId?: string): ProjectReportState => {
  const queryArgument = reportId ? { id: reportId } : skipToken;
  const query = useGetReportAnalysisQuery(queryArgument);
  const shouldPoll = !query.isError && query.data ? isReportProcessing(query.data.status) : false;

  useEffect(() => {
    if (!reportId || !shouldPoll) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void query.refetch();
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [query, reportId, shouldPoll]);

  if (!reportId) {
    return {
      status: 'notFound',
    };
  }

  if (query.isError) {
    const errorStatus = getApiErrorStatus(query.error);

    if (errorStatus === 404) {
      return {
        status: 'notFound',
      };
    }

    if (errorStatus === 500 || errorStatus === 503 || isApiTransportErrorStatus(errorStatus)) {
      return {
        status: 'serviceUnavailable',
      };
    }

    return {
      status: 'error',
    };
  }

  if (!query.data || query.isLoading) {
    return {
      status: 'loading',
    };
  }

  if (query.data.status === 'completed') {
    return {
      status: 'ready',
      report: query.data.report,
    };
  }

  if (query.data.status === 'failed') {
    return {
      status: 'failed',
      errorCode: query.data.errorCode,
      errorMessage: query.data.errorMessage,
      id: query.data.id,
    };
  }

  return {
    status: 'processing',
    analysisStatus: query.data.status,
    analysis: query.data.analysis,
  };
};
