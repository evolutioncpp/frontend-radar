import { useNavigate } from 'react-router-dom';

import { getDemoReportPath } from '@/shared/config/routes/appRoutes';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardAnalysisInfo } from './dashboard-analysis-info/DashboardAnalysisInfo';
import s from './DashboardPage.module.scss';

import type { RepositoryAnalysisRequest } from '@/features/repository-analysis';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const analyzeRepository = (_request: RepositoryAnalysisRequest) => {
    void navigate(getDemoReportPath());
  };

  return (
    <div className={s.dashboardPage}>
      <RepositoryAnalysisPanel onSubmit={analyzeRepository} />
      <DashboardAnalysisInfo />
    </div>
  );
};
