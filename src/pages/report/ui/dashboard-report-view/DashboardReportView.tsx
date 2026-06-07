import { useTranslation } from 'react-i18next';

import { useDashboardSectionsReady } from '@/features/dashboard-section-navigation';
import {
  DashboardSectionIds,
  dashboardSectionPageLabelKeys,
  type DashboardSectionId,
} from '@/shared/config/navigation/dashboardSections';
import { ChecksList } from '@/widgets/checks-list';
import { HealthScorePanel } from '@/widgets/health-score-panel';
import { MetricsGrid } from '@/widgets/metrics-grid';
import { RecommendationsPanel } from '@/widgets/recommendations-panel';
import { RepositorySummary } from '@/widgets/repository-summary';

import { DashboardReportSection } from '../dashboard-report-section/DashboardReportSection';
import { DashboardSectionCopyButton } from '../dashboard-section-copy-button/DashboardSectionCopyButton';
import s from '../ReportPage.module.scss';

import type { ProjectReport } from '@/entities/report';

interface DashboardReportViewProps {
  report: ProjectReport;
}

export const DashboardReportView = ({ report }: DashboardReportViewProps) => {
  const { t } = useTranslation('dashboard');

  useDashboardSectionsReady();

  const getSectionLabel = (sectionId: DashboardSectionId) => {
    return t(dashboardSectionPageLabelKeys[sectionId]);
  };

  return (
    <section className={s.content} aria-label={t('page.reportAria')}>
      <DashboardReportSection
        ariaLabel={getSectionLabel(DashboardSectionIds.REPOSITORY)}
        id={DashboardSectionIds.REPOSITORY}
      >
        <RepositorySummary
          headerAction={<DashboardSectionCopyButton sectionId={DashboardSectionIds.REPOSITORY} />}
          repository={report.repository}
        />
      </DashboardReportSection>

      <DashboardReportSection
        ariaLabel={getSectionLabel(DashboardSectionIds.HEALTH_SCORE)}
        id={DashboardSectionIds.HEALTH_SCORE}
      >
        <HealthScorePanel
          headerAction={<DashboardSectionCopyButton sectionId={DashboardSectionIds.HEALTH_SCORE} />}
          score={report.totalScore}
        />
      </DashboardReportSection>

      <DashboardReportSection
        ariaLabel={getSectionLabel(DashboardSectionIds.METRICS)}
        id={DashboardSectionIds.METRICS}
      >
        <MetricsGrid
          headerAction={<DashboardSectionCopyButton sectionId={DashboardSectionIds.METRICS} />}
          metrics={report.scoreBreakdown}
        />
      </DashboardReportSection>

      <div className={s.detailsGrid}>
        <DashboardReportSection
          ariaLabel={getSectionLabel(DashboardSectionIds.CHECKS)}
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
          ariaLabel={getSectionLabel(DashboardSectionIds.RECOMMENDATIONS)}
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
  );
};
