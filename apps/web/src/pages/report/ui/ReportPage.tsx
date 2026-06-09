import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useProjectReport } from '@/entities/report';
import { useRepositoryAnalysisSubmit } from '@/features/repository-analysis';
import { Card } from '@/shared/ui/Card';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardReportView } from './dashboard-report-view/DashboardReportView';
import s from './ReportPage.module.scss';

export const ReportPage = () => {
  const { t } = useTranslation('dashboard');
  const { id } = useParams();
  const reportState = useProjectReport(id);
  const repositoryAnalysisSubmit = useRepositoryAnalysisSubmit();

  return (
    <div className={s.reportPage}>
      <RepositoryAnalysisPanel
        isSubmitting={repositoryAnalysisSubmit.isSubmitting}
        onChange={repositoryAnalysisSubmit.clearSubmitError}
        onSubmit={repositoryAnalysisSubmit.submitRepositoryAnalysis}
        submitError={repositoryAnalysisSubmit.submitError}
      />

      {reportState.status === 'ready' ? (
        <DashboardReportView report={reportState.report} />
      ) : reportState.status === 'loading' ? (
        <ReportStatusCard
          description={t('page.reportLoading.description')}
          title={t('page.reportLoading.title')}
        />
      ) : reportState.status === 'processing' ? (
        <ReportStatusCard
          description={t('page.reportProcessing.description')}
          title={t('page.reportProcessing.title')}
        />
      ) : reportState.status === 'error' ? (
        <ReportStatusCard
          description={t('page.reportError.description')}
          title={t('page.reportError.title')}
        />
      ) : reportState.status === 'failed' ? (
        <ReportStatusCard
          description={reportState.errorMessage || t('page.reportFailed.description')}
          title={t('page.reportFailed.title')}
        />
      ) : (
        <ReportStatusCard
          description={t('page.reportFallback.description')}
          title={t('page.reportFallback.title')}
        />
      )}
    </div>
  );
};

interface ReportStatusCardProps {
  description: string;
  title: string;
}

const ReportStatusCard = ({ description, title }: ReportStatusCardProps) => {
  return (
    <Card className={s.fallbackCard}>
      <h1 className={s.fallbackTitle}>{title}</h1>
      <p className={s.fallbackDescription}>{description}</p>
    </Card>
  );
};
