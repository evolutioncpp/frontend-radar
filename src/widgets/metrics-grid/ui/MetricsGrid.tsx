import { useTranslation } from 'react-i18next';

import { getScoreStatusBadgeVariant, type ScoreBreakdownItem } from '@/entities/report';
import { normalizeScore } from '@/shared/lib/format-score';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Progress } from '@/shared/ui/Progress';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './MetricsGrid.module.scss';

import type { ReactNode } from 'react';

interface MetricsGridProps {
  metrics: ScoreBreakdownItem[];
  headerAction?: ReactNode;
}

const scoreStatusLabelKeys = {
  excellent: 'statuses.excellent',
  good: 'statuses.good',
  warning: 'statuses.warning',
  critical: 'statuses.critical',
} as const satisfies Record<ScoreBreakdownItem['status'], string>;

export const MetricsGrid = ({ headerAction, metrics }: MetricsGridProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <Card aria-label={t('metrics.label')} className={s.metricsGrid}>
      <SectionHeader
        action={headerAction}
        aside={<span className={s.counter}>{t('metrics.counter', { count: metrics.length })}</span>}
        label={t('metrics.label')}
        title={t('metrics.title')}
      />

      <ul aria-label={t('metrics.listAria')} className={s.list}>
        {metrics.map((metric) => {
          const normalizedValue = normalizeScore(metric.value, metric.maxValue);

          return (
            <li className={s.metricRow} key={metric.category}>
              <div className={s.metricMain}>
                <h3 className={s.metricTitle}>{metric.label}</h3>
                <p className={s.metricDescription}>{metric.description}</p>
              </div>

              <div className={s.metricMeta}>
                <Badge
                  className={s.metricStatus}
                  variant={getScoreStatusBadgeVariant(metric.status)}
                >
                  {t(scoreStatusLabelKeys[metric.status])}
                </Badge>

                <span
                  aria-label={t('metrics.scoreAria', {
                    label: metric.label,
                    score: normalizedValue,
                    max: metric.maxValue,
                  })}
                  className={s.metricScore}
                >
                  <span className={s.metricScoreValue}>{normalizedValue}</span>
                  <span className={s.metricScoreSeparator}>/</span>
                  <span className={s.metricScoreMax}>{metric.maxValue}</span>
                </span>
              </div>

              <Progress
                aria-label={t('metrics.progressAria', {
                  label: metric.label,
                })}
                className={s.metricProgress}
                max={metric.maxValue}
                value={metric.value}
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
