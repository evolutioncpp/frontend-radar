import type { GetReportComparisonResponse, ProjectReport } from './reportSchemas.js';

const createValueComparison = (current: number, previous: number) => {
  return {
    current,
    previous,
    delta: current - previous,
  };
};

export const buildReportComparison = (
  currentReport: ProjectReport,
  previousReport: ProjectReport,
): GetReportComparisonResponse => {
  const previousMetricsByCategory = new Map(
    previousReport.scoreBreakdown.map((metric) => [metric.category, metric]),
  );
  const previousChecksById = new Map(previousReport.checks.map((check) => [check.id, check]));
  const currentRecommendationIds = new Set(
    currentReport.recommendations.map((recommendation) => recommendation.id),
  );
  const previousRecommendationIds = new Set(
    previousReport.recommendations.map((recommendation) => recommendation.id),
  );

  return {
    status: 'available',
    currentReportId: currentReport.id,
    previousReportId: previousReport.id,
    totalScore: createValueComparison(currentReport.totalScore, previousReport.totalScore),
    metrics: currentReport.scoreBreakdown.flatMap((currentMetric) => {
      const previousMetric = previousMetricsByCategory.get(currentMetric.category);

      if (!previousMetric) {
        return [];
      }

      return [
        {
          category: currentMetric.category,
          label: currentMetric.label,
          currentValue: currentMetric.value,
          previousValue: previousMetric.value,
          delta: currentMetric.value - previousMetric.value,
          currentStatus: currentMetric.status,
          previousStatus: previousMetric.status,
        },
      ];
    }),
    checks: currentReport.checks.flatMap((currentCheck) => {
      const previousCheck = previousChecksById.get(currentCheck.id);

      if (!previousCheck || previousCheck.status === currentCheck.status) {
        return [];
      }

      return [
        {
          id: currentCheck.id,
          label: currentCheck.label,
          previousStatus: previousCheck.status,
          currentStatus: currentCheck.status,
        },
      ];
    }),
    recommendations: {
      added: currentReport.recommendations.filter(
        (recommendation) => !previousRecommendationIds.has(recommendation.id),
      ),
      resolved: previousReport.recommendations.filter(
        (recommendation) => !currentRecommendationIds.has(recommendation.id),
      ),
      persistentCount: currentReport.recommendations.filter((recommendation) =>
        previousRecommendationIds.has(recommendation.id),
      ).length,
    },
  };
};
