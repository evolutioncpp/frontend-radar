import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getReportPath } from '@/shared/config/routes/appRoutes';

import { useCreateReportAnalysisMutation } from './reportAnalysisApi';

import type { CreateReportAnalysisApiResponse } from './reportAnalysisApi';
import type { RepositoryAnalysisRequest } from './repositoryAnalysisTypes';

export type ReportAnalysisReuseReason = CreateReportAnalysisApiResponse['reuseReason'];

export interface ReportAnalysisNavigationState {
  reportAnalysisReuseReason?: ReportAnalysisReuseReason;
}

export type RepositoryAnalysisSubmitError =
  | 'repositoryNotFound'
  | 'repositoryForbidden'
  | 'githubRateLimited'
  | 'githubUnavailable'
  | 'projectPathNotFound'
  | 'repositoryVerificationFailed'
  | 'unknown'
  | null;

const getErrorCode = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'code' in error.data &&
    typeof error.data.code === 'string'
  ) {
    return error.data.code;
  }

  return null;
};

const getRepositoryAnalysisSubmitError = (error: unknown): RepositoryAnalysisSubmitError => {
  const errorCode = getErrorCode(error);

  if (errorCode === 'repository_not_found') {
    return 'repositoryNotFound';
  }

  if (errorCode === 'repository_forbidden') {
    return 'repositoryForbidden';
  }

  if (errorCode === 'github_rate_limited') {
    return 'githubRateLimited';
  }

  if (errorCode === 'github_unavailable') {
    return 'githubUnavailable';
  }

  if (errorCode === 'project_path_not_found') {
    return 'projectPathNotFound';
  }

  if (errorCode === 'repository_verification_failed') {
    return 'repositoryVerificationFailed';
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    if (error.status === 404) {
      return 'repositoryNotFound';
    }

    if (error.status === 403) {
      return 'repositoryForbidden';
    }

    if (error.status === 429) {
      return 'githubRateLimited';
    }

    if (error.status === 422) {
      return 'projectPathNotFound';
    }

    if (error.status === 502) {
      return 'repositoryVerificationFailed';
    }
  }

  return 'unknown';
};

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
