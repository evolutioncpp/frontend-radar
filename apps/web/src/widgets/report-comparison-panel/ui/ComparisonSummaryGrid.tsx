import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import s from './ReportComparisonPanel.module.scss';
import { deltaToneClassNames, toneClassNames } from './reportComparisonStyles';
import {
  formatDelta,
  getChangeTone,
  getDeltaTone,
  type ReportComparison,
  type ReportComparisonViewModel,
} from '../model/reportComparisonViewModel';

interface ComparisonSummaryGridProps {
  comparison: ReportComparison;
  viewModel: ReportComparisonViewModel;
}

export const ComparisonSummaryGrid = ({ comparison, viewModel }: ComparisonSummaryGridProps) => {
  const { t } = useTranslation('dashboard');
  const totalDeltaLabel =
    comparison.totalScore.delta === 0
      ? t('comparison.noDelta')
      : formatDelta(comparison.totalScore.delta);

  return (
    <div className={s.summaryGrid}>
      <div
        className={clsx(s.summaryItem, toneClassNames[getDeltaTone(comparison.totalScore.delta)])}
      >
        <span className={s.summaryLabel}>{t('comparison.totalScore')}</span>
        <span className={s.valuePair}>
          <span>{comparison.totalScore.previous}</span>
          <ArrowRight aria-hidden="true" className={s.valueArrow} strokeWidth={2} />
          <strong>{comparison.totalScore.current}</strong>
        </span>
        <span
          className={clsx(
            s.summaryMeta,
            deltaToneClassNames[getDeltaTone(comparison.totalScore.delta)],
          )}
        >
          {totalDeltaLabel}
        </span>
      </div>

      <div
        className={clsx(
          s.summaryItem,
          toneClassNames[
            getChangeTone(viewModel.improvedMetrics.length, viewModel.worsenedMetrics.length)
          ],
        )}
      >
        <span className={s.summaryLabel}>{t('comparison.metricsTitle')}</span>
        {viewModel.hasMetricChanges ? (
          <span className={s.summaryMetaList}>
            {viewModel.improvedMetrics.length > 0 && (
              <span className={s.deltaPositive}>
                {t('comparison.improvedMetrics', { count: viewModel.improvedMetrics.length })}
              </span>
            )}
            {viewModel.worsenedMetrics.length > 0 && (
              <span className={s.deltaNegative}>
                {t('comparison.worsenedMetrics', { count: viewModel.worsenedMetrics.length })}
              </span>
            )}
          </span>
        ) : (
          <span className={s.summaryMeta}>{t('comparison.noMetricChanges')}</span>
        )}

        {viewModel.unchangedMetricsCount > 0 && (
          <span className={s.summaryHint}>
            {t('comparison.unchangedMetrics', { count: viewModel.unchangedMetricsCount })}
          </span>
        )}
      </div>

      <div
        className={clsx(
          s.summaryItem,
          toneClassNames[
            getChangeTone(
              comparison.recommendations.resolved.length,
              comparison.recommendations.added.length,
            )
          ],
        )}
      >
        <span className={s.summaryLabel}>{t('comparison.recommendationsTitle')}</span>
        {viewModel.hasRecommendationChanges ? (
          <span className={s.summaryMetaList}>
            {comparison.recommendations.added.length > 0 && (
              <span className={s.deltaNegative}>
                {t('comparison.addedRecommendations', {
                  count: comparison.recommendations.added.length,
                })}
              </span>
            )}
            {comparison.recommendations.resolved.length > 0 && (
              <span className={s.deltaPositive}>
                {t('comparison.resolvedRecommendations', {
                  count: comparison.recommendations.resolved.length,
                })}
              </span>
            )}
          </span>
        ) : (
          <span className={s.summaryMeta}>{t('comparison.emptyRecommendations')}</span>
        )}

        {comparison.recommendations.persistentCount > 0 && (
          <span className={s.summaryHint}>
            {t('comparison.persistentRecommendations', {
              count: comparison.recommendations.persistentCount,
            })}
          </span>
        )}
      </div>
    </div>
  );
};
