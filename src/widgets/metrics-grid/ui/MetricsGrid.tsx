import {
  getScoreStatusBadgeVariant,
  getScoreStatusLabel,
  type ScoreBreakdownItem,
} from '@/entities/report';
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

export const MetricsGrid = ({ headerAction, metrics }: MetricsGridProps) => {
  return (
    <Card aria-label="Score breakdown" className={s.metricsGrid}>
      <SectionHeader
        action={headerAction}
        aside={<span className={s.counter}>{metrics.length} metrics</span>}
        label="Score breakdown"
        title="Quality metrics"
      />

      <ul aria-label="Metrics list" className={s.list}>
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
                  {getScoreStatusLabel(metric.status)}
                </Badge>

                <span
                  aria-label={`${metric.label} score ${normalizedValue} out of ${metric.maxValue}`}
                  className={s.metricScore}
                >
                  <span className={s.metricScoreValue}>{normalizedValue}</span>
                  <span className={s.metricScoreSeparator}>/</span>
                  <span className={s.metricScoreMax}>{metric.maxValue}</span>
                </span>
              </div>

              <Progress
                aria-label={`${metric.label} score progress`}
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
