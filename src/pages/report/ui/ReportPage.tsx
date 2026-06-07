import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useDemoReport } from '@/entities/report';
import { DEMO_REPORT_ID, getDemoReportPath } from '@/shared/config/routes/appRoutes';
import { Card } from '@/shared/ui/Card';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardReportView } from './dashboard-report-view/DashboardReportView';
import s from './ReportPage.module.scss';

import type { RepositoryAnalysisRequest } from '@/features/repository-analysis';

export const ReportPage = () => {
  const { id } = useParams();
  const { t } = useTranslation('dashboard');

  if (id !== DEMO_REPORT_ID) {
    return (
      <div className={s.reportPage}>
        <Card className={s.fallbackCard} variant="outlined">
          <h1 className={s.fallbackTitle}>{t('page.reportFallback.title')}</h1>
          <p className={s.fallbackDescription}>{t('page.reportFallback.description')}</p>
        </Card>
      </div>
    );
  }

  return <DemoReportPage />;
};

const DemoReportPage = () => {
  const report = useDemoReport();
  const navigate = useNavigate();

  const analyzeRepository = (_request: RepositoryAnalysisRequest) => {
    void navigate(getDemoReportPath());
  };

  return (
    <div className={s.reportPage}>
      <RepositoryAnalysisPanel onSubmit={analyzeRepository} />
      <DashboardReportView report={report} />
    </div>
  );
};
