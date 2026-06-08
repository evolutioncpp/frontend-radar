import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getDemoReportPath } from '@/shared/config/routes/appRoutes';

import type { RepositoryAnalysisRequest } from './repositoryAnalysisTypes';

export const useRepositoryAnalysisSubmit = () => {
  const navigate = useNavigate();

  return useCallback(
    (_request: RepositoryAnalysisRequest) => {
      void navigate(getDemoReportPath());
    },
    [navigate],
  );
};
