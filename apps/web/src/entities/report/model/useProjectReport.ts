import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';

import { useGetReportAnalysisQuery } from './reportApi';
import { isReportProcessing } from './reportSelectors';

import type { ProjectReport } from './types';

export type ProjectReportProcessingAnalysis = {
  owner: string;
  repository: string;
  normalizedUrl: string;
  branch: string;
  projectPath: string | null;
  latestCommitSha: string | null;
  latestCommitDate: string | null;
  latestCommitTitle: string | null;
  createdAt: string;
  updatedAt: string;
};

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
      status: 'failed';
      errorCode: string;
      errorMessage: string;
      id: string;
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
    if (
      typeof query.error === 'object' &&
      query.error !== null &&
      'status' in query.error &&
      query.error.status === 404
    ) {
      return {
        status: 'notFound',
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
