import { getScoreStatusBadgeVariant, getScoreStatusLabel } from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Progress } from '@/shared/ui/Progress';

import s from './MetricsGrid.module.scss';

import type { ScoreBreakdownItem } from '@/entities/report';

interface MetricsGridProps {
  metrics: ScoreBreakdownItem[];
}

export const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <section aria-label="Score breakdown" className={s.metricsGrid}>
      {metrics.map((metric) => (
        <Card className={s.metricCard} key={metric.category}>
          <div className={s.metricHeader}>
            <h3 className={s.metricTitle}>{metric.label}</h3>

            <Badge variant={getScoreStatusBadgeVariant(metric.status)}>
              {getScoreStatusLabel(metric.status)}
            </Badge>
          </div>

          <div className={s.metricScore}>
            <span className={s.metricScoreValue}>{metric.value}</span>
            <span className={s.metricScoreMax}>{metric.maxValue}</span>
          </div>

          <Progress
            aria-label={`${metric.label} score progress`}
            max={metric.maxValue}
            value={metric.value}
          />

          <p className={s.metricDescription}>{metric.description}</p>
        </Card>
      ))}
    </section>
  );
};
