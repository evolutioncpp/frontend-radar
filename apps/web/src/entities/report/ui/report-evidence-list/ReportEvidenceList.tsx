import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/shared/ui/Badge';

import s from './ReportEvidenceList.module.scss';

import type { ReportEvidence, ReportEvidenceStatus } from '../../model/types';

interface ReportEvidenceListProps {
  evidence: ReportEvidence[];
  className?: string;
}

const evidenceStatusLabelKeys = {
  found: 'evidence.statuses.found',
  missing: 'evidence.statuses.missing',
  warning: 'evidence.statuses.warning',
} as const satisfies Record<ReportEvidenceStatus, string>;

const evidenceStatusBadgeVariants = {
  found: 'success',
  missing: 'danger',
  warning: 'warning',
} as const satisfies Record<ReportEvidenceStatus, 'success' | 'danger' | 'warning'>;

const evidenceStatusOrder = {
  missing: 0,
  warning: 1,
  found: 2,
} as const satisfies Record<ReportEvidenceStatus, number>;

export const ReportEvidenceList = ({ className, evidence }: ReportEvidenceListProps) => {
  const { t } = useTranslation('dashboard');

  if (evidence.length === 0) {
    return null;
  }

  const sortedEvidence = [...evidence].sort(
    (left, right) => evidenceStatusOrder[left.status] - evidenceStatusOrder[right.status],
  );

  return (
    <details className={clsx(s.reportEvidenceList, className)}>
      <summary className={s.summary}>
        <ChevronDown aria-hidden="true" className={s.summaryIcon} strokeWidth={2} />
        <span>{t('evidence.title')}</span>
      </summary>

      <ul className={s.list}>
        {sortedEvidence.map((item) => (
          <li className={s.item} key={item.id}>
            <Badge className={s.status} variant={evidenceStatusBadgeVariants[item.status]}>
              {t(evidenceStatusLabelKeys[item.status])}
            </Badge>

            <div className={s.content}>
              <p className={s.label}>{item.label}</p>

              {item.description ? <p className={s.description}>{item.description}</p> : null}

              {item.source ? (
                <p className={s.source}>{t('evidence.source', { source: item.source })}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
};
