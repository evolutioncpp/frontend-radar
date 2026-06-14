import type { GetReportComparisonApiResponse } from '@/entities/report';

export type ReportComparison = Extract<
  GetReportComparisonApiResponse,
  {
    status: 'available';
  }
>;

export type Tone = 'mixed' | 'negative' | 'neutral' | 'positive';

export const scoreStatusLabelKeys = {
  excellent: 'statuses.excellent',
  good: 'statuses.good',
  warning: 'statuses.warning',
  critical: 'statuses.critical',
} as const satisfies Record<ReportComparison['metrics'][number]['currentStatus'], string>;

export const checkStatusLabelKeys = {
  passed: 'statuses.passed',
  failed: 'statuses.failed',
  warning: 'statuses.warning',
} as const satisfies Record<ReportComparison['checks'][number]['currentStatus'], string>;

export const recommendationSeverityLabelKeys = {
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

export const formatDelta = (delta: number) => {
  if (delta > 0) {
    return `+${delta}`;
  }

  return `${delta}`;
};

export const sortByDeltaImpact = <T extends { delta: number; label: string }>(items: T[]) => {
  return [...items].sort((first, second) => {
    const impactDelta = Math.abs(second.delta) - Math.abs(first.delta);

    if (impactDelta !== 0) {
      return impactDelta;
    }

    return first.label.localeCompare(second.label);
  });
};

export const getDeltaTone = (delta: number): Tone => {
  if (delta > 0) {
    return 'positive';
  }

  if (delta < 0) {
    return 'negative';
  }

  return 'neutral';
};

export const getChangeTone = (improvedCount: number, worsenedCount: number): Tone => {
  if (improvedCount > 0 && worsenedCount > 0) {
    return 'mixed';
  }

  if (improvedCount > 0) {
    return 'positive';
  }

  if (worsenedCount > 0) {
    return 'negative';
  }

  return 'neutral';
};

export const createReportComparisonViewModel = (comparison: ReportComparison) => {
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

  return {
    hasAnyChanges,
    hasMetricChanges,
    hasRecommendationChanges,
    improvedChecks,
    improvedItemsCount,
    improvedMetrics,
    unchangedMetricsCount,
    worsenedChecks,
    worsenedItemsCount,
    worsenedMetrics,
  };
};

export type ReportComparisonViewModel = ReturnType<typeof createReportComparisonViewModel>;
