import {
  getCheckStatusBadgeVariant,
  getCheckStatusLabel,
  type ReportCheck,
} from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';

import s from './ChecksList.module.scss';

interface ChecksListProps {
  checks: ReportCheck[];
}

const getChecksCounterLabel = (count: number) => {
  return `${count} ${count === 1 ? 'check' : 'checks'}`;
};

export const ChecksList = ({ checks }: ChecksListProps) => {
  return (
    <Card className={s.checksList}>
      <div className={s.header}>
        <div>
          <p className={s.label}>Project checks</p>
          <h2 className={s.title}>Quality signals</h2>
        </div>

        <span className={s.counter}>{getChecksCounterLabel(checks.length)}</span>
      </div>

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
