import { useTranslation } from 'react-i18next';

import { useReportHistory } from '@/entities/report';
import { Card } from '@/shared/ui/Card';

import s from './DashboardHistoryPage.module.scss';
import { HistoryReportGroup } from './history-report-group/HistoryReportGroup';

export const DashboardHistoryPage = () => {
  const { i18n, t } = useTranslation('dashboard-history');
  const historyQuery = useReportHistory(i18n.language);
  const historyGroups = historyQuery.groups;

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
      ) : historyGroups.length > 0 ? (
        historyGroups.map((group) => <HistoryReportGroup group={group} key={group.id} />)
      ) : (
        <Card className={s.emptyCard}>
          <h2 className={s.emptyTitle}>{t('page.emptyTitle')}</h2>
          <p className={s.emptyDescription}>{t('page.emptyDescription')}</p>
        </Card>
      )}
    </div>
  );
};
