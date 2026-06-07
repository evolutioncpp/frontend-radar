import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useProjectReport } from '@/entities/report';
import { getDemoReportPath } from '@/shared/config/routes/appRoutes';
import { Card } from '@/shared/ui/Card';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardReportView } from './dashboard-report-view/DashboardReportView';
import s from './ReportPage.module.scss';

import type { RepositoryAnalysisRequest } from '@/features/repository-analysis';

export const ReportPage = () => {
  const { id } = useParams();
  const reportState = useProjectReport(id);
  const navigate = useNavigate();

  const analyzeRepository = (_request: RepositoryAnalysisRequest) => {
    void navigate(getDemoReportPath());
  };

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
