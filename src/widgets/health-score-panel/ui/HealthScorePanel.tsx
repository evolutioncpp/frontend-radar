import { useId } from 'react';

import { getScoreStatus, getScoreStatusBadgeVariant, getScoreStatusLabel } from '@/entities/report';
import { formatScore, normalizeScore } from '@/shared/lib/format-score';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Progress } from '@/shared/ui/Progress';

import s from './HealthScorePanel.module.scss';

interface HealthScorePanelProps {
  score: number;
}

export const HealthScorePanel = ({ score }: HealthScorePanelProps) => {
  const titleId = useId();
  const normalizedScore = normalizeScore(score);
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

        <Badge variant={getScoreStatusBadgeVariant(status)}>{getScoreStatusLabel(status)}</Badge>
      </div>

      <div className={s.score}>
        <span className={s.scoreValue}>{normalizedScore}</span>
        <span className={s.scoreMax}>/100</span>
      </div>

      <Progress
        aria-label={`Frontend health score ${formatScore(normalizedScore)}`}
        value={normalizedScore}
      />

      <p className={s.description}>
        This score summarizes repository setup, documentation, testing, CI/CD, dependencies and
        maintainability signals.
      </p>
    </Card>
  );
};
