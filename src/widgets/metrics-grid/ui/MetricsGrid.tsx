import { Badge, type BadgeVariant } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Progress } from '@/shared/ui/Progress';

import s from './MetricsGrid.module.scss';

import type { ScoreBreakdownItem, ScoreStatus } from '@/entities/report';

interface MetricsGridProps {
  metrics: ScoreBreakdownItem[];
}

const getBadgeVariant = (status: ScoreStatus): BadgeVariant => {
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

const getStatusLabel = (status: ScoreStatus) => {
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

export const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <section aria-label="Score breakdown" className={s.metricsGrid}>
      {metrics.map((metric) => (
        <Card className={s.metricCard} key={metric.category}>
          <div className={s.metricHeader}>
            <h3 className={s.metricTitle}>{metric.label}</h3>

            <Badge variant={getBadgeVariant(metric.status)}>{getStatusLabel(metric.status)}</Badge>
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
