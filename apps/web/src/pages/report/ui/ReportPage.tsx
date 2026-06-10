import { useTranslation } from 'react-i18next';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { useProjectReport, useReportComparison } from '@/entities/report';
import {
  type ReportAnalysisNavigationState,
  useReportForceRefresh,
  useRepositoryAnalysisSubmit,
} from '@/features/repository-analysis';
import { Card } from '@/shared/ui/Card';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardReportView } from './dashboard-report-view/DashboardReportView';
import s from './ReportPage.module.scss';

const reportAnalysisReuseReasons = ['completed', 'active', 'retried'] as const;

const isReportAnalysisReuseReason = (
  value: unknown,
): value is NonNullable<ReportAnalysisNavigationState['reportAnalysisReuseReason']> => {
  return (
    typeof value === 'string' && (reportAnalysisReuseReasons as readonly string[]).includes(value)
  );
};

const getReportAnalysisReuseReason = (state: unknown) => {
  if (typeof state === 'object' && state !== null && 'reportAnalysisReuseReason' in state) {
    const reuseReason = state.reportAnalysisReuseReason;

    if (isReportAnalysisReuseReason(reuseReason)) {
      return reuseReason;
    }
  }

  return null;
};

export const ReportPage = () => {
  const { t } = useTranslation('dashboard');
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reuseReason = getReportAnalysisReuseReason(location.state);
  const compareWith = searchParams.get('compareWith') || null;
  const reportState = useProjectReport(id);
  const comparisonState = useReportComparison(
    reportState.status === 'ready' ? id : undefined,
    compareWith,
  );
  const reportForceRefresh = useReportForceRefresh(id);
  const repositoryAnalysisSubmit = useRepositoryAnalysisSubmit();

  return (
    <div className={s.reportPage}>
      <RepositoryAnalysisPanel
        isSubmitting={repositoryAnalysisSubmit.isSubmitting}
        onChange={repositoryAnalysisSubmit.clearSubmitError}
        onSubmit={repositoryAnalysisSubmit.submitRepositoryAnalysis}
        submitError={repositoryAnalysisSubmit.submitError}
      />

      {reuseReason ? (
        <ReportReuseNotice
          description={t(`page.reportReuse.${reuseReason}.description`)}
          title={t(`page.reportReuse.${reuseReason}.title`)}
        />
      ) : null}

      {reportForceRefresh.refreshNotice ? (
        <ReportReuseNotice
          description={t(`page.reportRefresh.${reportForceRefresh.refreshNotice}.description`)}
          title={t(`page.reportRefresh.${reportForceRefresh.refreshNotice}.title`)}
        />
      ) : null}

      {reportState.status === 'ready' ? (
        <DashboardReportView
          comparison={comparisonState.status === 'available' ? comparisonState.comparison : null}
          comparisonMode={compareWith ? 'manual' : 'automatic'}
          isRefreshing={reportForceRefresh.isRefreshing}
          onForceRefresh={reportForceRefresh.refreshReport}
          report={reportState.report}
        />
      ) : reportState.status === 'loading' ? (
        <ReportStatusCard
          description={t('page.reportLoading.description')}
          title={t('page.reportLoading.title')}
        />
      ) : reportState.status === 'processing' ? (
        <ReportStatusCard
          description={t('page.reportProcessing.description')}
          title={t('page.reportProcessing.title')}
        />
      ) : reportState.status === 'error' ? (
        <ReportStatusCard
          description={t('page.reportError.description')}
          title={t('page.reportError.title')}
        />
      ) : reportState.status === 'failed' ? (
        <ReportStatusCard
          description={reportState.errorMessage || t('page.reportFailed.description')}
          title={t('page.reportFailed.title')}
        />
      ) : (
        <ReportStatusCard
          description={t('page.reportFallback.description')}
          title={t('page.reportFallback.title')}
        />
      )}
    </div>
  );
};

interface ReportReuseNoticeProps {
  description: string;
  title: string;
}

const ReportReuseNotice = ({ description, title }: ReportReuseNoticeProps) => {
  return (
    <div className={s.reuseNotice} role="status">
      <strong className={s.reuseNoticeTitle}>{title}</strong>
      <span className={s.reuseNoticeDescription}>{description}</span>
    </div>
  );
};

interface ReportStatusCardProps {
  description: string;
  title: string;
}

const ReportStatusCard = ({ description, title }: ReportStatusCardProps) => {
  return (
    <Card className={s.fallbackCard}>
      <h1 className={s.fallbackTitle}>{title}</h1>
      <p className={s.fallbackDescription}>{description}</p>
    </Card>
  );
};
