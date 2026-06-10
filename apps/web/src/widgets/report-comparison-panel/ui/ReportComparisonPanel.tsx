import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  getCheckStatusBadgeVariant,
  getRecommendationSeverityBadgeVariant,
  getScoreStatusBadgeVariant,
} from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './ReportComparisonPanel.module.scss';

import type { GetReportComparisonApiResponse } from '@/entities/report';
import type { ReactNode } from 'react';

type ReportComparison = Extract<
  GetReportComparisonApiResponse,
  {
    status: 'available';
  }
>;

interface ReportComparisonPanelProps {
  comparison: ReportComparison;
  headerAction?: ReactNode;
}

const scoreStatusLabelKeys = {
  excellent: 'statuses.excellent',
  good: 'statuses.good',
  warning: 'statuses.warning',
  critical: 'statuses.critical',
} as const satisfies Record<ReportComparison['metrics'][number]['currentStatus'], string>;

const checkStatusLabelKeys = {
  passed: 'statuses.passed',
  failed: 'statuses.failed',
  warning: 'statuses.warning',
} as const satisfies Record<ReportComparison['checks'][number]['currentStatus'], string>;

const recommendationSeverityLabelKeys = {
  high: 'statuses.high',
  medium: 'statuses.medium',
  low: 'statuses.low',
} as const satisfies Record<
  ReportComparison['recommendations']['added'][number]['severity'],
  string
>;

const checkStatusRanks = {
  failed: 0,
  warning: 1,
  passed: 2,
} as const satisfies Record<ReportComparison['checks'][number]['currentStatus'], number>;

const formatDelta = (delta: number) => {
  if (delta > 0) {
    return `+${delta}`;
  }

  return `${delta}`;
};

const sortByDeltaImpact = <T extends { delta: number; label: string }>(items: T[]) => {
  return [...items].sort((first, second) => {
    const impactDelta = Math.abs(second.delta) - Math.abs(first.delta);

    if (impactDelta !== 0) {
      return impactDelta;
    }

    return first.label.localeCompare(second.label);
  });
};

const getDeltaClassName = (delta: number) => {
  if (delta > 0) {
    return s.deltaPositive;
  }

  if (delta < 0) {
    return s.deltaNegative;
  }

  return s.deltaNeutral;
};

const getToneClassName = (value: number) => {
  if (value > 0) {
    return s.tonePositive;
  }

  if (value < 0) {
    return s.toneNegative;
  }

  return s.toneNeutral;
};

const getChangeToneClassName = (improvedCount: number, worsenedCount: number) => {
  if (improvedCount > 0 && worsenedCount > 0) {
    return s.toneMixed;
  }

  if (improvedCount > 0) {
    return s.tonePositive;
  }

  if (worsenedCount > 0) {
    return s.toneNegative;
  }

  return s.toneNeutral;
};

export const ReportComparisonPanel = ({ comparison, headerAction }: ReportComparisonPanelProps) => {
  const { t } = useTranslation('dashboard');

  const improvedMetrics = sortByDeltaImpact(
    comparison.metrics.filter((metric) => metric.delta > 0),
  );
  const worsenedMetrics = sortByDeltaImpact(
    comparison.metrics.filter((metric) => metric.delta < 0),
  );
  const unchangedMetricsCount = comparison.metrics.filter((metric) => metric.delta === 0).length;
  const improvedChecks = comparison.checks.filter(
    (check) => checkStatusRanks[check.currentStatus] > checkStatusRanks[check.previousStatus],
  );
  const worsenedChecks = comparison.checks.filter(
    (check) => checkStatusRanks[check.currentStatus] < checkStatusRanks[check.previousStatus],
  );
  const improvedItemsCount =
    improvedMetrics.length + improvedChecks.length + comparison.recommendations.resolved.length;
  const worsenedItemsCount =
    worsenedMetrics.length + worsenedChecks.length + comparison.recommendations.added.length;
  const hasMetricChanges = improvedMetrics.length > 0 || worsenedMetrics.length > 0;
  const hasRecommendationChanges =
    comparison.recommendations.added.length > 0 || comparison.recommendations.resolved.length > 0;
  const hasAnyChanges =
    comparison.totalScore.delta !== 0 ||
    hasMetricChanges ||
    improvedChecks.length > 0 ||
    worsenedChecks.length > 0 ||
    hasRecommendationChanges;
  const totalDeltaLabel =
    comparison.totalScore.delta === 0
      ? t('comparison.noDelta')
      : formatDelta(comparison.totalScore.delta);

  const renderMetricItem = (metric: ReportComparison['metrics'][number]) => (
    <li className={s.changeItem} key={`metric-${metric.category}`}>
      <div className={s.itemMain}>
        <p className={s.itemTitle}>{metric.label}</p>
        <span className={s.valuePair}>
          <span>{metric.previousValue}</span>
          <ArrowRight aria-hidden="true" className={s.valueArrow} strokeWidth={2} />
          <strong>{metric.currentValue}</strong>
        </span>
      </div>

      <div className={s.itemMeta}>
        <span className={clsx(s.delta, getDeltaClassName(metric.delta))}>
          {formatDelta(metric.delta)}
        </span>
        <Badge variant={getScoreStatusBadgeVariant(metric.currentStatus)}>
          {t(scoreStatusLabelKeys[metric.currentStatus])}
        </Badge>
      </div>
    </li>
  );

  const renderCheckItem = (check: ReportComparison['checks'][number]) => (
    <li className={s.changeItem} key={`check-${check.id}`}>
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

  const renderAddedRecommendation = (
    recommendation: ReportComparison['recommendations']['added'][number],
  ) => (
    <li className={s.changeItem} key={`added-${recommendation.id}`}>
      <Badge variant={getRecommendationSeverityBadgeVariant(recommendation.severity)}>
        {t(recommendationSeverityLabelKeys[recommendation.severity])}
      </Badge>
      <span className={s.recommendationTitle}>{recommendation.title}</span>
    </li>
  );

  const renderResolvedRecommendation = (
    recommendation: ReportComparison['recommendations']['resolved'][number],
  ) => (
    <li className={s.changeItem} key={`resolved-${recommendation.id}`}>
      <Badge variant="success">{t('comparison.resolvedBadge')}</Badge>
      <span className={s.recommendationTitle}>{recommendation.title}</span>
    </li>
  );

  return (
    <Card aria-label={t('comparison.label')} className={s.comparisonPanel}>
      <SectionHeader
        action={headerAction}
        aside={
          <span
            aria-label={t('comparison.totalScoreDeltaAria', {
              delta: totalDeltaLabel,
            })}
            className={clsx(s.totalDelta, getDeltaClassName(comparison.totalScore.delta))}
          >
            {totalDeltaLabel}
          </span>
        }
        label={t('comparison.label')}
        title={t('comparison.title')}
      />

      <p className={s.description}>{t('comparison.description')}</p>

      <div className={s.summaryGrid}>
        <div className={clsx(s.summaryItem, getToneClassName(comparison.totalScore.delta))}>
          <span className={s.summaryLabel}>{t('comparison.totalScore')}</span>
          <span className={s.valuePair}>
            <span>{comparison.totalScore.previous}</span>
            <ArrowRight aria-hidden="true" className={s.valueArrow} strokeWidth={2} />
            <strong>{comparison.totalScore.current}</strong>
          </span>
          <span className={clsx(s.summaryMeta, getDeltaClassName(comparison.totalScore.delta))}>
            {totalDeltaLabel}
          </span>
        </div>

        <div
          className={clsx(
            s.summaryItem,
            getChangeToneClassName(improvedMetrics.length, worsenedMetrics.length),
          )}
        >
          <span className={s.summaryLabel}>{t('comparison.metricsTitle')}</span>
          {hasMetricChanges ? (
            <span className={s.summaryMetaList}>
              {improvedMetrics.length > 0 && (
                <span className={s.deltaPositive}>
                  {t('comparison.improvedMetrics', { count: improvedMetrics.length })}
                </span>
              )}
              {worsenedMetrics.length > 0 && (
                <span className={s.deltaNegative}>
                  {t('comparison.worsenedMetrics', { count: worsenedMetrics.length })}
                </span>
              )}
            </span>
          ) : (
            <span className={s.summaryMeta}>{t('comparison.noMetricChanges')}</span>
          )}

          {unchangedMetricsCount > 0 && (
            <span className={s.summaryHint}>
              {t('comparison.unchangedMetrics', { count: unchangedMetricsCount })}
            </span>
          )}
        </div>

        <div
          className={clsx(
            s.summaryItem,
            getChangeToneClassName(
              comparison.recommendations.resolved.length,
              comparison.recommendations.added.length,
            ),
          )}
        >
          <span className={s.summaryLabel}>{t('comparison.recommendationsTitle')}</span>
          {hasRecommendationChanges ? (
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

      {!hasAnyChanges ? (
        <div className={clsx(s.noChanges, s.toneNeutral)} role="status">
          <h3 className={s.sectionTitle}>{t('comparison.noChangesTitle')}</h3>
          <p className={s.emptyState}>{t('comparison.noChangesDescription')}</p>
        </div>
      ) : (
        <div className={s.changeGroups}>
          <section className={s.changeGroup}>
            <div className={s.changeGroupHeader}>
              <h3 className={s.sectionTitle}>{t('comparison.improvedTitle')}</h3>
              {improvedItemsCount > 0 && (
                <span className={clsx(s.groupCount, s.deltaPositive)}>
                  {t('comparison.groupItems', { count: improvedItemsCount })}
                </span>
              )}
            </div>

            {improvedItemsCount > 0 ? (
              <ul className={s.changeList}>
                {improvedMetrics.map(renderMetricItem)}
                {improvedChecks.map(renderCheckItem)}
                {comparison.recommendations.resolved.map(renderResolvedRecommendation)}
              </ul>
            ) : (
              <p className={s.emptyState}>{t('comparison.noImprovedItems')}</p>
            )}
          </section>

          <section className={s.changeGroup}>
            <div className={s.changeGroupHeader}>
              <h3 className={s.sectionTitle}>{t('comparison.worsenedTitle')}</h3>
              {worsenedItemsCount > 0 && (
                <span className={clsx(s.groupCount, s.deltaNegative)}>
                  {t('comparison.groupItems', { count: worsenedItemsCount })}
                </span>
              )}
            </div>

            {worsenedItemsCount > 0 ? (
              <ul className={s.changeList}>
                {worsenedMetrics.map(renderMetricItem)}
                {worsenedChecks.map(renderCheckItem)}
                {comparison.recommendations.added.map(renderAddedRecommendation)}
              </ul>
            ) : (
              <p className={s.emptyState}>{t('comparison.noWorsenedItems')}</p>
            )}
          </section>
        </div>
      )}
    </Card>
  );
};
