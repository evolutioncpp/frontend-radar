import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { normalizeScore } from '@/shared/lib/format-score';
import { Card } from '@/shared/ui/Card';

import s from '../DashboardHistoryPage.module.scss';

interface HistoryReportCardProps {
  activityAt: string;
  activityLabel: string;
  checksCount: number;
  metricsCount: number;
  recommendationsCount: number;
  repositoryName: string;
  score?: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  to: string;
}

export const HistoryReportCard = ({
  activityAt,
  activityLabel,
  checksCount,
  metricsCount,
  recommendationsCount,
  repositoryName,
  score,
  status,
  to,
}: HistoryReportCardProps) => {
  const { t } = useTranslation('dashboard-history');
  const normalizedScore = typeof score === 'number' ? normalizeScore(score) : null;

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
            <p className={s.cardLabel}>{t('card.label')}</p>
            <time className={s.cardDateCompact} dateTime={activityAt}>
              {activityLabel}
            </time>
          </div>

          <div className={s.repository}>
            <h2 className={s.repositoryName}>{repositoryName}</h2>
            <p className={s.meta}>
              <time dateTime={activityAt}>
                {t('card.analyzedAt', {
                  date: activityLabel,
                })}
              </time>
              <span className={s.metaSeparator}>/</span>
              <span>{t(`card.statuses.${status}`)}</span>
            </p>
          </div>
        </div>

        <div className={s.cardAside}>
          <div className={s.score}>
            <span className={s.scoreLabel}>{t('card.scoreLabel')}</span>
            {normalizedScore === null ? (
              <span className={s.scorePending}>{t(`card.statuses.${status}`)}</span>
            ) : (
              <span className={s.scoreValueWrapper}>
                <span className={s.scoreValue}>{normalizedScore}</span>
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
    </Card>
  );
};
