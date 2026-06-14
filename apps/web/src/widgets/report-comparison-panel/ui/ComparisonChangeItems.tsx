import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  getCheckStatusBadgeVariant,
  getRecommendationSeverityBadgeVariant,
  getScoreStatusBadgeVariant,
} from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';

import s from './ReportComparisonPanel.module.scss';
import { deltaToneClassNames } from './reportComparisonStyles';
import {
  checkStatusLabelKeys,
  formatDelta,
  getDeltaTone,
  recommendationSeverityLabelKeys,
  scoreStatusLabelKeys,
} from '../model/reportComparisonViewModel';

import type { ReportComparison } from '../model/reportComparisonViewModel';

interface ComparisonMetricChangeItemProps {
  metric: ReportComparison['metrics'][number];
}

export const ComparisonMetricChangeItem = ({ metric }: ComparisonMetricChangeItemProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <li className={s.changeItem}>
      <div className={s.itemMain}>
        <p className={s.itemTitle}>{metric.label}</p>
        <span className={s.valuePair}>
          <span>{metric.previousValue}</span>
          <ArrowRight aria-hidden="true" className={s.valueArrow} strokeWidth={2} />
          <strong>{metric.currentValue}</strong>
        </span>
      </div>

      <div className={s.itemMeta}>
        <span className={clsx(s.delta, deltaToneClassNames[getDeltaTone(metric.delta)])}>
          {formatDelta(metric.delta)}
        </span>
        <Badge variant={getScoreStatusBadgeVariant(metric.currentStatus)}>
          {t(scoreStatusLabelKeys[metric.currentStatus])}
        </Badge>
      </div>
    </li>
  );
};

interface ComparisonCheckChangeItemProps {
  check: ReportComparison['checks'][number];
}

export const ComparisonCheckChangeItem = ({ check }: ComparisonCheckChangeItemProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <li className={s.changeItem}>
      <p className={s.itemTitle}>{check.label}</p>
      <span className={s.badgePair}>
        <Badge variant={getCheckStatusBadgeVariant(check.previousStatus)}>
          {t(checkStatusLabelKeys[check.previousStatus])}
        </Badge>
        <ArrowRight aria-hidden="true" className={s.valueArrow} strokeWidth={2} />
        <Badge variant={getCheckStatusBadgeVariant(check.currentStatus)}>
          {t(checkStatusLabelKeys[check.currentStatus])}
        </Badge>
      </span>
    </li>
  );
};

interface ComparisonAddedRecommendationItemProps {
  recommendation: ReportComparison['recommendations']['added'][number];
}

export const ComparisonAddedRecommendationItem = ({
  recommendation,
}: ComparisonAddedRecommendationItemProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <li className={s.changeItem}>
      <Badge variant={getRecommendationSeverityBadgeVariant(recommendation.severity)}>
        {t(recommendationSeverityLabelKeys[recommendation.severity])}
      </Badge>
      <span className={s.recommendationTitle}>{recommendation.title}</span>
    </li>
  );
};

interface ComparisonResolvedRecommendationItemProps {
  recommendation: ReportComparison['recommendations']['resolved'][number];
}

export const ComparisonResolvedRecommendationItem = ({
  recommendation,
}: ComparisonResolvedRecommendationItemProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <li className={s.changeItem}>
      <Badge variant="success">{t('comparison.resolvedBadge')}</Badge>
      <span className={s.recommendationTitle}>{recommendation.title}</span>
    </li>
  );
};
