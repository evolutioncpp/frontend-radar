import { useTranslation } from 'react-i18next';

import { useDemoReport } from '@/entities/report';
import { useDashboardSectionsReady } from '@/features/dashboard-section-navigation';
import { DashboardSectionIds } from '@/shared/config/navigation/dashboardSections';
import { ChecksList } from '@/widgets/checks-list';
import { HealthScorePanel } from '@/widgets/health-score-panel';
import { MetricsGrid } from '@/widgets/metrics-grid';
import { RecommendationsPanel } from '@/widgets/recommendations-panel';
import { RepositorySummary } from '@/widgets/repository-summary';

import { DashboardReportSection } from './dashboard-report-section/DashboardReportSection';
import { DashboardSectionCopyButton } from './dashboard-section-copy-button/DashboardSectionCopyButton';
import s from './DashboardPage.module.scss';

export const DashboardPage = () => {
  const { t } = useTranslation('dashboard');

  const report = useDemoReport();

  useDashboardSectionsReady();

  return (
    <div className={s.dashboardPage}>
      <section className={s.header}>
        <p className={s.label}>{t('page.label')}</p>

        <h1 className={s.title}>{t('page.title')}</h1>

        <p className={s.description}>{t('page.description')}</p>
      </section>

      <section className={s.content} aria-label={t('page.reportAria')}>
        <DashboardReportSection
          ariaLabel={t('page.sections.repository')}
          id={DashboardSectionIds.REPOSITORY}
        >
          <RepositorySummary
            headerAction={<DashboardSectionCopyButton sectionId={DashboardSectionIds.REPOSITORY} />}
            repository={report.repository}
          />
        </DashboardReportSection>

        <DashboardReportSection
          ariaLabel={t('page.sections.healthScore')}
          id={DashboardSectionIds.HEALTH_SCORE}
        >
          <HealthScorePanel
            headerAction={
              <DashboardSectionCopyButton sectionId={DashboardSectionIds.HEALTH_SCORE} />
            }
            score={report.totalScore}
          />
        </DashboardReportSection>

        <DashboardReportSection
          ariaLabel={t('page.sections.metrics')}
          id={DashboardSectionIds.METRICS}
        >
          <MetricsGrid
            headerAction={<DashboardSectionCopyButton sectionId={DashboardSectionIds.METRICS} />}
            metrics={report.scoreBreakdown}
          />
        </DashboardReportSection>

        <div className={s.detailsGrid}>
          <DashboardReportSection
            ariaLabel={t('page.sections.checks')}
            className={s.detailsSection}
            id={DashboardSectionIds.CHECKS}
          >
            <ChecksList
              checks={report.checks}
              className={s.detailsCard}
              headerAction={<DashboardSectionCopyButton sectionId={DashboardSectionIds.CHECKS} />}
            />
          </DashboardReportSection>

          <DashboardReportSection
            ariaLabel={t('page.sections.recommendations')}
            className={s.detailsSection}
            id={DashboardSectionIds.RECOMMENDATIONS}
          >
            <RecommendationsPanel
              className={s.detailsCard}
              headerAction={
                <DashboardSectionCopyButton sectionId={DashboardSectionIds.RECOMMENDATIONS} />
              }
              recommendations={report.recommendations}
            />
          </DashboardReportSection>
        </div>
      </section>
    </div>
  );
};
