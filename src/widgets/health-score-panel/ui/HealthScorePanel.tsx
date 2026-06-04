import clsx from 'clsx';

import {
  getScoreStatus,
  getScoreStatusBadgeVariant,
  getScoreStatusLabel,
  type ScoreStatus,
} from '@/entities/report';
import { normalizeScore } from '@/shared/lib/format-score';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Progress } from '@/shared/ui/Progress';

import s from './HealthScorePanel.module.scss';

import type { ReactNode } from 'react';

interface HealthScorePanelProps {
  score: number;
  headerAction?: ReactNode;
}

const scoreStatusClassMap: Record<ScoreStatus, string> = {
  excellent: s.scoreValueExcellent,
  good: s.scoreValueGood,
  warning: s.scoreValueWarning,
  critical: s.scoreValueCritical,
};

export const HealthScorePanel = ({ headerAction, score }: HealthScorePanelProps) => {
  const normalizedScore = normalizeScore(score);
  const status = getScoreStatus(normalizedScore);

  return (
    <Card className={s.healthScorePanel}>
      <div className={s.header}>
        <div className={s.heading}>
          <div className={s.labelRow}>
            <p className={s.label}>Frontend Health Score</p>
            {headerAction}
          </div>

          <h2 className={s.title}>Overall project quality</h2>
        </div>

        <Badge className={s.status} variant={getScoreStatusBadgeVariant(status)}>
          {getScoreStatusLabel(status)}
        </Badge>
      </div>

      <div className={s.scoreBlock}>
        <div aria-label={`Frontend health score ${normalizedScore} out of 100`} className={s.score}>
          <span className={clsx(s.scoreValue, scoreStatusClassMap[status])}>{normalizedScore}</span>
          <span className={s.scoreMax}>/100</span>
        </div>

        <p className={s.description}>
          This score summarizes repository setup, documentation, testing, CI/CD, dependencies and
          maintainability signals.
        </p>
      </div>

      <Progress
        aria-label="Frontend health score progress"
        className={s.progress}
        value={normalizedScore}
      />
    </Card>
  );
};
