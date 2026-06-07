import { useRepositoryAnalysisSubmit } from '@/features/repository-analysis';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardAnalysisInfo } from './dashboard-analysis-info/DashboardAnalysisInfo';
import s from './DashboardPage.module.scss';

export const DashboardPage = () => {
  const analyzeRepository = useRepositoryAnalysisSubmit();

  return (
    <div className={s.dashboardPage}>
      <RepositoryAnalysisPanel onSubmit={analyzeRepository} />
      <DashboardAnalysisInfo />
    </div>
  );
};
