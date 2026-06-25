import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import {
  getCheckStatusBadgeVariant,
  reportCheckStatusLabelKeys,
  type ReportCheck,
} from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './ChecksList.module.scss';

import type { ReactNode } from 'react';

interface ChecksListProps {
  checks: ReportCheck[];
  className?: string;
  headerAction?: ReactNode;
}

export const ChecksList = ({ checks, className, headerAction }: ChecksListProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <Card className={clsx(s.checksList, className)}>
      <SectionHeader
        action={headerAction}
        aside={<span className={s.counter}>{t('checks.counter', { count: checks.length })}</span>}
        label={t('checks.label')}
        title={t('checks.title')}
      />

      <ul aria-label={t('checks.listAria')} className={s.list}>
        {checks.map((check) => (
          <li className={s.item} key={check.id}>
            <Badge className={s.status} variant={getCheckStatusBadgeVariant(check.status)}>
              {t(reportCheckStatusLabelKeys[check.status])}
            </Badge>

            <div className={s.content}>
              <p className={s.checkLabel}>{check.label}</p>

              {check.description ? <p className={s.description}>{check.description}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};
