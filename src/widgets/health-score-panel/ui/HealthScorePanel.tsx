import { useId } from 'react';

import { getScoreStatus } from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Progress } from '@/shared/ui/Progress';

import s from './HealthScorePanel.module.scss';

interface HealthScorePanelProps {
  score: number;
}

const getBadgeVariant = (status: ReturnType<typeof getScoreStatus>) => {
  switch (status) {
    case 'excellent':
      return 'success';
    case 'good':
      return 'info';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'danger';
  }
};

const getStatusLabel = (status: ReturnType<typeof getScoreStatus>) => {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'warning':
      return 'Needs attention';
    case 'critical':
      return 'Critical';
  }
};

export const HealthScorePanel = ({ score }: HealthScorePanelProps) => {
  const titleId = useId();
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const status = getScoreStatus(normalizedScore);

  return (
    <Card aria-labelledby={titleId} className={s.healthScorePanel}>
      <div className={s.header}>
        <div className={s.headerInfo}>
          <p className={s.label}>Frontend Health Score</p>
          <h2 className={s.title} id={titleId}>
            Overall project quality
          </h2>
        </div>

        <Badge variant={getBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
      </div>

      <div className={s.score}>
        <span className={s.scoreValue}>{normalizedScore}</span>
        <span className={s.scoreMax}>/100</span>
      </div>

      <Progress aria-label="Frontend health score progress" value={normalizedScore} />

      <p className={s.description}>
        This score summarizes repository setup, documentation, testing, CI/CD, dependencies and
        maintainability signals.
      </p>
    </Card>
  );
};
