import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { useProjectReport, useReportComparison } from '@/entities/report';
import {
  type ReportAnalysisNavigationState,
  useReportForceRefresh,
  useRepositoryAnalysisSubmit,
  useRetryReportAnalysisMutation,
} from '@/features/repository-analysis';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Spinner } from '@/shared/ui/Spinner';
import { RepositoryAnalysisPanel } from '@/widgets/repository-analysis-panel';

import { DashboardReportView } from './dashboard-report-view/DashboardReportView';
import { ReportProcessingPanel } from './report-processing-panel/ReportProcessingPanel';
import s from './ReportPage.module.scss';

const reportAnalysisReuseReasons = ['completed', 'active', 'retried'] as const;
const repositoryAnalysisPanelId = 'repository-analysis';

const reportFailureCopyKeys = {
  analysis_failed: {
    description: 'page.reportFailed.errors.analysisFailed.description',
    title: 'page.reportFailed.errors.analysisFailed.title',
  },
  branch_not_found: {
    description: 'page.reportFailed.errors.branchNotFound.description',
    title: 'page.reportFailed.errors.branchNotFound.title',
  },
  github_rate_limited: {
    description: 'page.reportFailed.errors.githubRateLimited.description',
    title: 'page.reportFailed.errors.githubRateLimited.title',
  },
  github_unavailable: {
    description: 'page.reportFailed.errors.githubUnavailable.description',
    title: 'page.reportFailed.errors.githubUnavailable.title',
  },
  project_path_not_found: {
    description: 'page.reportFailed.errors.projectPathNotFound.description',
    title: 'page.reportFailed.errors.projectPathNotFound.title',
  },
  repository_forbidden: {
    description: 'page.reportFailed.errors.repositoryForbidden.description',
    title: 'page.reportFailed.errors.repositoryForbidden.title',
  },
  repository_not_found: {
    description: 'page.reportFailed.errors.repositoryNotFound.description',
    title: 'page.reportFailed.errors.repositoryNotFound.title',
  },
  repository_verification_failed: {
    description: 'page.reportFailed.errors.repositoryVerificationFailed.description',
    title: 'page.reportFailed.errors.repositoryVerificationFailed.title',
  },
} as const;

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

const getReportFailureCopyKeys = (errorCode: string) => {
  if (errorCode in reportFailureCopyKeys) {
    return reportFailureCopyKeys[errorCode as keyof typeof reportFailureCopyKeys];
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
  const [retryReportAnalysis, { isLoading: isRetrying }] = useRetryReportAnalysisMutation();
  const [isRetryErrorVisible, setIsRetryErrorVisible] = useState(false);
  const failedReportCopyKeys =
    reportState.status === 'failed' ? getReportFailureCopyKeys(reportState.errorCode) : null;
  const retryFailedReport = () => {
    if (reportState.status !== 'failed') {
      return;
    }

    setIsRetryErrorVisible(false);

    void retryReportAnalysis({
      id: reportState.id,
    })
      .unwrap()
      .catch(() => {
        setIsRetryErrorVisible(true);
      });
  };

  return (
    <div className={s.reportPage}>
      <RepositoryAnalysisPanel
        id={repositoryAnalysisPanelId}
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

      {isRetryErrorVisible ? (
        <ReportReuseNotice
          description={t('page.reportRetry.error.description')}
          title={t('page.reportRetry.error.title')}
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
          spinnerLabel={t('page.reportLoading.spinnerLabel')}
          title={t('page.reportLoading.title')}
        />
      ) : reportState.status === 'processing' ? (
        <ReportProcessingPanel
          analysis={reportState.analysis}
          status={reportState.analysisStatus}
        />
      ) : reportState.status === 'error' ? (
        <ReportStatusCard
          actionHref={`#${repositoryAnalysisPanelId}`}
          actionLabel={t('page.reportStatusAction')}
          description={t('page.reportError.description')}
          title={t('page.reportError.title')}
        />
      ) : reportState.status === 'serviceUnavailable' ? (
        <ReportStatusCard
          actionHref={`#${repositoryAnalysisPanelId}`}
          actionLabel={t('page.reportStatusAction')}
          description={t('page.reportServiceUnavailable.description')}
          title={t('page.reportServiceUnavailable.title')}
        />
      ) : reportState.status === 'failed' ? (
        <ReportStatusCard
          actionDisabled={isRetrying}
          actionLabel={t('page.reportStatusAction')}
          actionLoadingLabel={t('page.reportStatusActionLoading')}
          onAction={retryFailedReport}
          description={
            failedReportCopyKeys
              ? t(failedReportCopyKeys.description)
              : reportState.errorMessage || t('page.reportFailed.description')
          }
          title={
            failedReportCopyKeys ? t(failedReportCopyKeys.title) : t('page.reportFailed.title')
          }
        />
      ) : (
        <ReportStatusCard
          actionHref={`#${repositoryAnalysisPanelId}`}
          actionLabel={t('page.reportStatusAction')}
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
  actionDisabled?: boolean;
  actionHref?: string;
  actionLabel?: string;
  actionLoadingLabel?: string;
  description: string;
  onAction?: () => void;
  spinnerLabel?: string;
  title: string;
}

const ReportStatusCard = ({
  actionDisabled = false,
  actionHref,
  actionLabel,
  actionLoadingLabel,
  description,
  onAction,
  spinnerLabel,
  title,
}: ReportStatusCardProps) => {
  const actionContent = actionDisabled && actionLoadingLabel ? actionLoadingLabel : actionLabel;

  return (
    <Card className={s.fallbackCard}>
      <div className={s.fallbackHeading}>
        {spinnerLabel ? (
          <Spinner className={s.fallbackSpinner} label={spinnerLabel} size="md" />
        ) : null}
        <h1 className={s.fallbackTitle}>{title}</h1>
      </div>
      <p className={s.fallbackDescription}>{description}</p>
      {onAction && actionLabel ? (
        <Button
          className={s.fallbackButton}
          disabled={actionDisabled}
          onClick={onAction}
          type="button"
        >
          {actionContent}
        </Button>
      ) : actionHref && actionLabel ? (
        <a className={s.fallbackAction} href={actionHref}>
          {actionContent}
        </a>
      ) : null}
    </Card>
  );
};
