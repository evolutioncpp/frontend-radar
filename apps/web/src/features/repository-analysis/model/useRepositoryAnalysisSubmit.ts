import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getReportPath } from '@/shared/config/routes/appRoutes';

import { useCreateReportAnalysisMutation } from './reportAnalysisApi';
import { getRepositoryAnalysisSubmitError } from './repositoryAnalysisErrors';

import type { CreateReportAnalysisApiResponse } from './reportAnalysisApi';
import type { RepositoryAnalysisSubmitError } from './repositoryAnalysisErrors';
import type { RepositoryAnalysisRequest } from './repositoryAnalysisTypes';

export type ReportAnalysisReuseReason = CreateReportAnalysisApiResponse['reuseReason'];

export interface ReportAnalysisNavigationState {
  reportAnalysisReuseReason?: ReportAnalysisReuseReason;
}

export type { RepositoryAnalysisSubmitError };

const getReportAnalysisReuseReason = (analysis: {
  reuseReason?: ReportAnalysisReuseReason;
}): ReportAnalysisReuseReason => {
  return analysis.reuseReason ?? null;
};

export const useRepositoryAnalysisSubmit = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<RepositoryAnalysisSubmitError>(null);
  const [createReportAnalysis, { isLoading: isSubmitting }] = useCreateReportAnalysisMutation();

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const submitRepositoryAnalysis = useCallback(
    (request: RepositoryAnalysisRequest) => {
      setSubmitError(null);

      void createReportAnalysis({
        body: request,
      })
        .unwrap()
        .then((analysis) => {
          const reuseReason = getReportAnalysisReuseReason(analysis);

          void navigate(getReportPath(analysis.id), {
            state: reuseReason
              ? {
                  reportAnalysisReuseReason: reuseReason,
                }
              : undefined,
          });
        })
        .catch((error: unknown) => {
          setSubmitError(getRepositoryAnalysisSubmitError(error));
        });
    },
    [createReportAnalysis, navigate],
  );

  return {
    clearSubmitError,
    isSubmitting,
    submitError,
    submitRepositoryAnalysis,
  };
};
