import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/shared/ui/Badge';

import s from './ReportScoreDetailsList.module.scss';

import type { ScoreDetails, ScoringCheckStatus } from '../../model/types';
import type { BadgeVariant } from '@/shared/ui/Badge';

interface ReportScoreDetailsListProps {
  className?: string;
  scoreDetails: ScoreDetails;
}

const checkStatusOrder = {
  failed: 0,
  partial: 1,
  unknown: 2,
  not_applicable: 3,
  passed: 4,
} as const satisfies Record<ScoringCheckStatus, number>;

const checkStatusLabelKeys = {
  failed: 'scoreDetails.statuses.failed',
  partial: 'scoreDetails.statuses.partial',
  passed: 'scoreDetails.statuses.passed',
  unknown: 'scoreDetails.statuses.unknown',
  not_applicable: 'scoreDetails.statuses.notApplicable',
} as const satisfies Record<ScoringCheckStatus, string>;

const checkStatusBadgeVariants = {
  failed: 'danger',
  partial: 'warning',
  passed: 'success',
  unknown: 'info',
  not_applicable: 'default',
} as const satisfies Record<ScoringCheckStatus, BadgeVariant>;

export const ReportScoreDetailsList = ({
  className,
  scoreDetails,
}: ReportScoreDetailsListProps) => {
  const { t } = useTranslation('dashboard');

  if (scoreDetails.checks.length === 0) {
    return null;
  }

  const sortedChecks = [...scoreDetails.checks].sort(
    (left, right) => checkStatusOrder[left.status] - checkStatusOrder[right.status],
  );

  return (
    <details className={clsx(s.reportScoreDetailsList, className)}>
      <summary className={s.summary}>
        <ChevronDown aria-hidden="true" className={s.summaryIcon} strokeWidth={2} />
        <span>{t('scoreDetails.title')}</span>
      </summary>

      <div className={s.content}>
        <div className={s.metaGrid}>
          <div>
            <span className={s.metaLabel}>{t('scoreDetails.rawValue')}</span>
            <strong className={s.metaValue}>{scoreDetails.rawValue}/100</strong>
          </div>
          <div>
            <span className={s.metaLabel}>{t('scoreDetails.finalValue')}</span>
            <strong className={s.metaValue}>{scoreDetails.finalValue}/100</strong>
          </div>
          <div>
            <span className={s.metaLabel}>{t('scoreDetails.impact')}</span>
            <strong className={s.metaValue}>
              {t(`scoreDetails.impactLevels.${scoreDetails.impactLevel}`)}
            </strong>
          </div>
        </div>

        {scoreDetails.cap ? (
          <div className={s.cap}>
            <strong>{t('scoreDetails.cap.title', { value: scoreDetails.cap.value })}</strong>
            <span>{scoreDetails.cap.reason}</span>
            {scoreDetails.cap.source ? (
              <span className={s.source}>
                {t('scoreDetails.source', { source: scoreDetails.cap.source })}
              </span>
            ) : null}
          </div>
        ) : null}

        <ul className={s.list}>
          {sortedChecks.map((check) => (
            <li className={s.item} key={check.id}>
              <Badge className={s.status} variant={checkStatusBadgeVariants[check.status]}>
                {t(checkStatusLabelKeys[check.status])}
              </Badge>

              <div className={s.itemContent}>
                <div className={s.itemHeader}>
                  <p className={s.label}>{check.label}</p>
                  <span className={s.points}>
                    {t('scoreDetails.points', {
                      earned: check.earned,
                      max: check.max,
                    })}
                  </span>
                </div>

                {check.description ? <p className={s.description}>{check.description}</p> : null}

                <div className={s.tags}>
                  <span>{t(`scoreDetails.scopes.${check.scope}`)}</span>
                  <span>{t(`scoreDetails.severities.${check.severity}`)}</span>
                  <span>{t(`scoreDetails.confidences.${check.confidence}`)}</span>
                </div>

                {check.source ? (
                  <p className={s.source}>{t('scoreDetails.source', { source: check.source })}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
};
