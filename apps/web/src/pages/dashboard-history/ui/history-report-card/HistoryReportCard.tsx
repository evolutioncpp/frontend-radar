import clsx from 'clsx';
import { GitCommit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getScoreStatus, type ScoreStatus } from '@/entities/report';
import { normalizeScore } from '@/shared/lib/format-score';
import { Card } from '@/shared/ui/Card';

import s from '../DashboardHistoryPage.module.scss';
import { ReportRunMetadataList } from '../report-run-metadata-list/ReportRunMetadataList';

import type { ReactNode } from 'react';

interface HistoryReportCardProps {
  activityAt: string;
  activityLabel: string;
  branch: string;
  children?: ReactNode;
  checksCount: number;
  commitTitle?: string | null;
  metricsCount: number;
  projectPath?: string | null;
  recommendationsCount: number;
  repositoryName: string;
  score?: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  to: string;
}

const scoreStatusClassMap: Record<ScoreStatus, string> = {
  excellent: s.scoreValueExcellent,
  good: s.scoreValueGood,
  warning: s.scoreValueWarning,
  critical: s.scoreValueCritical,
};

export const HistoryReportCard = ({
  activityAt,
  activityLabel,
  branch,
  children,
  checksCount,
  commitTitle,
  metricsCount,
  projectPath,
  recommendationsCount,
  repositoryName,
  score,
  status,
  to,
}: HistoryReportCardProps) => {
  const { t } = useTranslation('dashboard-history');
  const normalizedScore = typeof score === 'number' ? normalizeScore(score) : null;
  const scoreStatusClassName =
    normalizedScore === null ? undefined : scoreStatusClassMap[getScoreStatus(normalizedScore)];

  return (
    <Card className={s.historyCard}>
      <Link
        aria-label={t('card.openReportAria', {
          repository: repositoryName,
        })}
        className={s.cardLink}
        to={to}
      >
        <div className={s.cardMain}>
          <div className={s.cardTop}>
            <p className={s.cardLabel}>{t('card.latestRunLabel')}</p>
            <time className={s.cardDateCompact} dateTime={activityAt}>
              {activityLabel}
            </time>
          </div>

          <div className={s.repository}>
            <div className={s.repositoryHeader}>
              <h2 className={s.repositoryName}>{repositoryName}</h2>
              {commitTitle ? (
                <p className={s.commitTitle} title={commitTitle}>
                  <GitCommit aria-hidden="true" className={s.commitTitleIcon} strokeWidth={2} />
                  <span className={s.commitTitleText}>{commitTitle}</span>
                </p>
              ) : null}
            </div>
            <ReportRunMetadataList
              activityAt={activityAt}
              activityLabel={activityLabel}
              branch={branch}
              projectPath={projectPath}
              status={status}
            />
          </div>
        </div>

        <div className={s.cardAside}>
          <div className={s.score}>
            <span className={s.scoreLabel}>{t('card.scoreLabel')}</span>
            {normalizedScore === null ? (
              <span className={s.scorePending}>{t(`card.statuses.${status}`)}</span>
            ) : (
              <span className={s.scoreValueWrapper}>
                <span className={clsx(s.scoreValue, scoreStatusClassName)}>{normalizedScore}</span>
                <span className={s.scoreMax}>/100</span>
              </span>
            )}
          </div>

          <dl className={s.summaryList}>
            <div className={s.summaryItem}>
              <dt className={s.summaryLabel}>{t('card.summary.metrics')}</dt>
              <dd className={s.summaryValue}>{metricsCount}</dd>
            </div>

            <div className={s.summaryItem}>
              <dt className={s.summaryLabel}>{t('card.summary.checks')}</dt>
              <dd className={s.summaryValue}>{checksCount}</dd>
            </div>

            <div className={s.summaryItem}>
              <dt className={s.summaryLabel}>{t('card.summary.recommendations')}</dt>
              <dd className={s.summaryValue}>{recommendationsCount}</dd>
            </div>
          </dl>
        </div>
      </Link>

      {children}
    </Card>
  );
};
