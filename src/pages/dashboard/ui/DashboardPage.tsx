import { useTranslation } from 'react-i18next';

import { useDemoReport } from '@/entities/report';

import { DashboardReportView } from './dashboard-report-view/DashboardReportView';
import s from './DashboardPage.module.scss';

export const DashboardPage = () => {
  const { t } = useTranslation('dashboard');

  const report = useDemoReport();

  return (
    <div className={s.dashboardPage}>
      <section className={s.header}>
        <p className={s.label}>{t('page.label')}</p>

        <h1 className={s.title}>{t('page.title')}</h1>

        <p className={s.description}>{t('page.description')}</p>
      </section>

      <DashboardReportView report={report} />
    </div>
  );
};
