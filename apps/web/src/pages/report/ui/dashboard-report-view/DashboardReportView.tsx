import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useDashboardSectionsReady } from '@/features/dashboard-section-navigation';
import { ReportExportButton } from '@/features/report-export';
import {
  DashboardSectionIds,
  dashboardSectionPageLabelKeys,
  type DashboardSectionId,
} from '@/shared/config/navigation/dashboardSections';
import { Button } from '@/shared/ui/Button';
import { AnalysisDetailsPanel } from '@/widgets/analysis-details-panel';
import { ChecksList } from '@/widgets/checks-list';
import { HealthScorePanel } from '@/widgets/health-score-panel';
import { MetricsGrid } from '@/widgets/metrics-grid';
import { RecommendationsPanel } from '@/widgets/recommendations-panel';
import {
  ReportComparisonPanel,
  ReportComparisonUnavailablePanel,
} from '@/widgets/report-comparison-panel';
import { RepositorySummary } from '@/widgets/repository-summary';

import { DashboardReportSection } from '../dashboard-report-section/DashboardReportSection';
import { DashboardSectionCopyButton } from '../dashboard-section-copy-button/DashboardSectionCopyButton';
import s from '../ReportPage.module.scss';

import type { GetReportComparisonApiResponse, ProjectReport } from '@/entities/report';

interface DashboardReportViewProps {
  comparison?: Extract<GetReportComparisonApiResponse, { status: 'available' }> | null;
  comparisonMode?: 'automatic' | 'manual';
  comparisonUnavailable?: Extract<GetReportComparisonApiResponse, { status: 'unavailable' }> | null;
  isRefreshing?: boolean;
  onForceRefresh?: () => void;
  report: ProjectReport;
}

export const DashboardReportView = ({
  comparison = null,
  comparisonMode = 'automatic',
  comparisonUnavailable = null,
  isRefreshing = false,
  onForceRefresh,
  report,
}: DashboardReportViewProps) => {
  const { t } = useTranslation('dashboard');
  const hasComparisonSection = Boolean(comparison || comparisonUnavailable);

  useDashboardSectionsReady(hasComparisonSection ? 'with-comparison' : 'without-comparison');

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
          asideAction={
            <>
              <ReportExportButton className={s.refreshButton} report={report} />

              {onForceRefresh ? (
                <Button
                  className={s.refreshButton}
                  disabled={isRefreshing}
                  onClick={onForceRefresh}
                  type="button"
                  variant="secondary"
                >
                  <RefreshCw className={s.refreshIcon} aria-hidden="true" strokeWidth={2} />
                  {isRefreshing ? t('repository.refreshLoading') : t('repository.refresh')}
                </Button>
              ) : null}
            </>
          }
          headerAction={<DashboardSectionCopyButton sectionId={DashboardSectionIds.REPOSITORY} />}
          repository={report.repository}
        />
      </DashboardReportSection>

      <DashboardReportSection
        ariaLabel={getSectionLabel(DashboardSectionIds.ANALYSIS_DETAILS)}
        id={DashboardSectionIds.ANALYSIS_DETAILS}
      >
        <AnalysisDetailsPanel
          analysisSources={report.analysisSources}
          headerAction={
            <DashboardSectionCopyButton sectionId={DashboardSectionIds.ANALYSIS_DETAILS} />
          }
          tooling={report.tooling}
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

      {hasComparisonSection ? (
        <DashboardReportSection
          ariaLabel={getSectionLabel(DashboardSectionIds.COMPARISON)}
          id={DashboardSectionIds.COMPARISON}
        >
          {comparison ? (
            <ReportComparisonPanel
              branch={report.repository.branch || report.repository.defaultBranch}
              comparison={comparison}
              headerAction={
                <DashboardSectionCopyButton sectionId={DashboardSectionIds.COMPARISON} />
              }
              mode={comparisonMode}
            />
          ) : (
            <ReportComparisonUnavailablePanel
              headerAction={
                <DashboardSectionCopyButton sectionId={DashboardSectionIds.COMPARISON} />
              }
              reason={comparisonUnavailable?.reason}
            />
          )}
        </DashboardReportSection>
      ) : null}

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
