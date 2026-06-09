import { useTranslation } from 'react-i18next';

import { useReportHistory } from '@/entities/report';
import { getReportPath } from '@/shared/config/routes/appRoutes';
import { Card } from '@/shared/ui/Card';

import s from './DashboardHistoryPage.module.scss';
import { HistoryReportCard } from './history-report-card/HistoryReportCard';

export const DashboardHistoryPage = () => {
  const { i18n, t } = useTranslation('dashboard-history');
  const historyQuery = useReportHistory(i18n.language);
  const history = historyQuery.items;

  return (
    <div className={s.dashboardHistoryPage}>
      <section className={s.header}>
        <h1 className={s.title}>{t('page.title')}</h1>
        <p className={s.description}>{t('page.description')}</p>
      </section>

      {historyQuery.isLoading ? (
        <Card className={s.emptyCard}>
          <h2 className={s.emptyTitle}>{t('page.loadingTitle')}</h2>
          <p className={s.emptyDescription}>{t('page.loadingDescription')}</p>
        </Card>
      ) : historyQuery.isError ? (
        <Card className={s.emptyCard}>
          <h2 className={s.emptyTitle}>{t('page.errorTitle')}</h2>
          <p className={s.emptyDescription}>{t('page.errorDescription')}</p>
        </Card>
      ) : history.length > 0 ? (
        history.map((item) => (
          <HistoryReportCard
            activityAt={item.activityAt}
            activityLabel={item.activityLabel}
            checksCount={item.checksCount}
            key={item.id}
            metricsCount={item.metricsCount}
            recommendationsCount={item.recommendationsCount}
            repositoryName={item.repositoryName}
            score={item.score}
            status={item.status}
            to={getReportPath(item.id)}
          />
        ))
      ) : (
        <Card className={s.emptyCard}>
          <h2 className={s.emptyTitle}>{t('page.emptyTitle')}</h2>
          <p className={s.emptyDescription}>{t('page.emptyDescription')}</p>
        </Card>
      )}
    </div>
  );
};
