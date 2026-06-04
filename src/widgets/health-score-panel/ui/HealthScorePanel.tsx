import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { getScoreStatus, getScoreStatusBadgeVariant, type ScoreStatus } from '@/entities/report';
import { normalizeScore } from '@/shared/lib/format-score';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Progress } from '@/shared/ui/Progress';
import { SectionHeader } from '@/shared/ui/SectionHeader';

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

const scoreStatusLabelKeys = {
  excellent: 'statuses.excellent',
  good: 'statuses.good',
  warning: 'statuses.warning',
  critical: 'statuses.critical',
} as const satisfies Record<ScoreStatus, string>;

export const HealthScorePanel = ({ headerAction, score }: HealthScorePanelProps) => {
  const { t } = useTranslation('dashboard');

  const normalizedScore = normalizeScore(score);
  const status = getScoreStatus(normalizedScore);

  return (
    <Card className={s.healthScorePanel}>
      <SectionHeader
        action={headerAction}
        aside={
          <Badge className={s.status} variant={getScoreStatusBadgeVariant(status)}>
            {t(scoreStatusLabelKeys[status])}
          </Badge>
        }
        label={t('healthScore.label')}
        title={t('healthScore.title')}
      />

      <div className={s.scoreBlock}>
        <div
          aria-label={t('healthScore.scoreAria', {
            score: normalizedScore,
          })}
          className={s.score}
        >
          <span className={clsx(s.scoreValue, scoreStatusClassMap[status])}>{normalizedScore}</span>
          <span className={s.scoreMax}>/100</span>
        </div>

        <p className={s.description}>{t('healthScore.description')}</p>
      </div>

      <Progress
        aria-label={t('healthScore.progressAria')}
        className={s.progress}
        value={normalizedScore}
      />
    </Card>
  );
};
