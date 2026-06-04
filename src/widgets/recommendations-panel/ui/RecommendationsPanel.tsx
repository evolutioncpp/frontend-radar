import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import {
  getRecommendationSeverityBadgeVariant,
  type ReportRecommendation,
} from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './RecommendationsPanel.module.scss';

import type { ReactNode } from 'react';

interface RecommendationsPanelProps {
  recommendations: ReportRecommendation[];
  className?: string;
  headerAction?: ReactNode;
}

const recommendationSeverityLabelKeys = {
  high: 'statuses.high',
  medium: 'statuses.medium',
  low: 'statuses.low',
} as const satisfies Record<ReportRecommendation['severity'], string>;

export const RecommendationsPanel = ({
  className,
  headerAction,
  recommendations,
}: RecommendationsPanelProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <Card className={clsx(s.recommendationsPanel, className)}>
      <SectionHeader
        action={headerAction}
        aside={
          <span className={s.counter}>
            {t('recommendations.counter', { count: recommendations.length })}
          </span>
        }
        label={t('recommendations.label')}
        title={t('recommendations.title')}
      />

      {recommendations.length > 0 ? (
        <ul aria-label={t('recommendations.listAria')} className={s.list}>
          {recommendations.map((recommendation) => (
            <li className={s.item} key={recommendation.id}>
              <Badge
                className={s.severity}
                variant={getRecommendationSeverityBadgeVariant(recommendation.severity)}
              >
                {t(recommendationSeverityLabelKeys[recommendation.severity])}
              </Badge>

              <div className={s.content}>
                <p className={s.recommendationTitle}>{recommendation.title}</p>
                <p className={s.description}>{recommendation.description}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={s.emptyState}>{t('recommendations.empty')}</p>
      )}
    </Card>
  );
};
