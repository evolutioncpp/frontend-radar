import { useRepositoryAnalysisSubmit } from '@/features/repository-analysis';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardAnalysisInfo } from './dashboard-analysis-info/DashboardAnalysisInfo';
import s from './DashboardPage.module.scss';

export const DashboardPage = () => {
  const repositoryAnalysisSubmit = useRepositoryAnalysisSubmit();

  return (
    <div className={s.dashboardPage}>
      <RepositoryAnalysisPanel
        isSubmitting={repositoryAnalysisSubmit.isSubmitting}
        onChange={repositoryAnalysisSubmit.clearSubmitError}
        onSubmit={repositoryAnalysisSubmit.submitRepositoryAnalysis}
        submitError={repositoryAnalysisSubmit.submitError}
      />
      <DashboardAnalysisInfo />
    </div>
  );
};
