import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useProjectReport } from '@/entities/report';
import { useRepositoryAnalysisSubmit } from '@/features/repository-analysis';
import { Card } from '@/shared/ui/Card';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardReportView } from './dashboard-report-view/DashboardReportView';
import s from './ReportPage.module.scss';

export const ReportPage = () => {
  const { id } = useParams();
  const reportState = useProjectReport(id);
  const analyzeRepository = useRepositoryAnalysisSubmit();

  return (
    <div className={s.reportPage}>
      <RepositoryAnalysisPanel onSubmit={analyzeRepository} />

      {reportState.status === 'ready' ? (
        <DashboardReportView report={reportState.report} />
      ) : (
        <ReportFallback />
      )}
    </div>
  );
};

const ReportFallback = () => {
  const { t } = useTranslation('dashboard');

  return (
    <Card className={s.fallbackCard}>
      <h1 className={s.fallbackTitle}>{t('page.reportFallback.title')}</h1>
      <p className={s.fallbackDescription}>{t('page.reportFallback.description')}</p>
    </Card>
  );
};
