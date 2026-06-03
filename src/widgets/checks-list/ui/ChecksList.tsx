import clsx from 'clsx';

import {
  getCheckStatusBadgeVariant,
  getCheckStatusLabel,
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

const getChecksCounterLabel = (count: number) => {
  return `${count} ${count === 1 ? 'check' : 'checks'}`;
};

export const ChecksList = ({ checks, className, headerAction }: ChecksListProps) => {
  return (
    <Card className={clsx(s.checksList, className)}>
      <SectionHeader
        action={headerAction}
        aside={<span className={s.counter}>{getChecksCounterLabel(checks.length)}</span>}
        label="Project checks"
        title="Quality signals"
      />

      <ul aria-label="Project checks list" className={s.list}>
        {checks.map((check) => (
          <li className={s.item} key={check.id}>
            <Badge className={s.status} variant={getCheckStatusBadgeVariant(check.status)}>
              {getCheckStatusLabel(check.status)}
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
