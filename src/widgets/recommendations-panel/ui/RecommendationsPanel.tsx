import clsx from 'clsx';

import {
  getRecommendationSeverityBadgeVariant,
  getRecommendationSeverityLabel,
  type ReportRecommendation,
} from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';

import s from './RecommendationsPanel.module.scss';

import type { ReactNode } from 'react';

interface RecommendationsPanelProps {
  recommendations: ReportRecommendation[];
  className?: string;
  headerAction?: ReactNode;
}

const getRecommendationsCounterLabel = (count: number) => {
  return `${count} ${count === 1 ? 'recommendation' : 'recommendations'}`;
};

export const RecommendationsPanel = ({
  className,
  headerAction,
  recommendations,
}: RecommendationsPanelProps) => {
  return (
    <Card className={clsx(s.recommendationsPanel, className)}>
      <div className={s.header}>
        <div>
          <div className={s.labelRow}>
            <p className={s.label}>Next steps</p>
            {headerAction}
          </div>

          <h2 className={s.title}>Recommendations</h2>
        </div>

        <span className={s.counter}>{getRecommendationsCounterLabel(recommendations.length)}</span>
      </div>

      {recommendations.length > 0 ? (
        <ul aria-label="Recommendations list" className={s.list}>
          {recommendations.map((recommendation) => (
            <li className={s.item} key={recommendation.id}>
              <Badge
                className={s.severity}
                variant={getRecommendationSeverityBadgeVariant(recommendation.severity)}
              >
                {getRecommendationSeverityLabel(recommendation.severity)}
              </Badge>

              <div className={s.content}>
                <p className={s.recommendationTitle}>{recommendation.title}</p>
                <p className={s.description}>{recommendation.description}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={s.emptyState}>No recommendations for now.</p>
      )}
    </Card>
  );
};
