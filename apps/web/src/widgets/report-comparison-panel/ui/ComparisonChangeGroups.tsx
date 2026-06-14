import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import {
  ComparisonAddedRecommendationItem,
  ComparisonCheckChangeItem,
  ComparisonMetricChangeItem,
  ComparisonResolvedRecommendationItem,
} from './ComparisonChangeItems';
import s from './ReportComparisonPanel.module.scss';

import type {
  ReportComparison,
  ReportComparisonViewModel,
} from '../model/reportComparisonViewModel';

interface ComparisonChangeGroupsProps {
  comparison: ReportComparison;
  viewModel: ReportComparisonViewModel;
}

export const ComparisonChangeGroups = ({ comparison, viewModel }: ComparisonChangeGroupsProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className={s.changeGroups}>
      <section className={s.changeGroup}>
        <div className={s.changeGroupHeader}>
          <h3 className={s.sectionTitle}>{t('comparison.improvedTitle')}</h3>
          {viewModel.improvedItemsCount > 0 && (
            <span className={clsx(s.groupCount, s.deltaPositive)}>
              {t('comparison.groupItems', { count: viewModel.improvedItemsCount })}
            </span>
          )}
        </div>

        {viewModel.improvedItemsCount > 0 ? (
          <ul className={s.changeList}>
            {viewModel.improvedMetrics.map((metric) => (
              <ComparisonMetricChangeItem key={`metric-${metric.category}`} metric={metric} />
            ))}
            {viewModel.improvedChecks.map((check) => (
              <ComparisonCheckChangeItem key={`check-${check.id}`} check={check} />
            ))}
            {comparison.recommendations.resolved.map((recommendation) => (
              <ComparisonResolvedRecommendationItem
                key={`resolved-${recommendation.id}`}
                recommendation={recommendation}
              />
            ))}
          </ul>
        ) : (
          <p className={s.emptyState}>{t('comparison.noImprovedItems')}</p>
        )}
      </section>

      <section className={s.changeGroup}>
        <div className={s.changeGroupHeader}>
          <h3 className={s.sectionTitle}>{t('comparison.worsenedTitle')}</h3>
          {viewModel.worsenedItemsCount > 0 && (
            <span className={clsx(s.groupCount, s.deltaNegative)}>
              {t('comparison.groupItems', { count: viewModel.worsenedItemsCount })}
            </span>
          )}
        </div>

        {viewModel.worsenedItemsCount > 0 ? (
          <ul className={s.changeList}>
            {viewModel.worsenedMetrics.map((metric) => (
              <ComparisonMetricChangeItem key={`metric-${metric.category}`} metric={metric} />
            ))}
            {viewModel.worsenedChecks.map((check) => (
              <ComparisonCheckChangeItem key={`check-${check.id}`} check={check} />
            ))}
            {comparison.recommendations.added.map((recommendation) => (
              <ComparisonAddedRecommendationItem
                key={`added-${recommendation.id}`}
                recommendation={recommendation}
              />
            ))}
          </ul>
        ) : (
          <p className={s.emptyState}>{t('comparison.noWorsenedItems')}</p>
        )}
      </section>
    </div>
  );
};
