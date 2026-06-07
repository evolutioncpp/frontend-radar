import { useTranslation } from 'react-i18next';

import { useProjectReport } from '@/entities/report';
import { DEMO_REPORT_ID, getDemoReportPath } from '@/shared/config/routes/appRoutes';
import { formatDate } from '@/shared/lib/format-date';
import { Card } from '@/shared/ui/Card';

import s from './DashboardHistoryPage.module.scss';
import { HistoryReportCard } from './history-report-card/HistoryReportCard';

export const DashboardHistoryPage = () => {
  const { i18n, t } = useTranslation('dashboard-history');
  const reportState = useProjectReport(DEMO_REPORT_ID);

  return (
    <div className={s.dashboardHistoryPage}>
      <section className={s.header}>
        <h1 className={s.title}>{t('page.title')}</h1>
        <p className={s.description}>{t('page.description')}</p>
      </section>

      {reportState.status === 'ready' ? (
        <HistoryReportCard
          analyzedAt={formatDate(reportState.report.createdAt, i18n.language)}
          checksCount={reportState.report.checks.length}
          createdAt={reportState.report.createdAt}
          metricsCount={reportState.report.scoreBreakdown.length}
          recommendationsCount={reportState.report.recommendations.length}
          repositoryName={`${reportState.report.repository.owner}/${reportState.report.repository.name}`}
          score={reportState.report.totalScore}
          to={getDemoReportPath()}
        />
      ) : (
        <Card className={s.emptyCard}>
          <h2 className={s.emptyTitle}>{t('page.emptyTitle')}</h2>
          <p className={s.emptyDescription}>{t('page.emptyDescription')}</p>
        </Card>
      )}
    </div>
  );
};
