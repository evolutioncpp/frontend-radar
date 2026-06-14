import {
  defaultEnabledScoreCategories,
  normalizeEnabledScoreCategories,
} from './reportScoreCategories.js';

import type { ProjectReport } from './reportSchemas.js';
import type { ScoreCategory } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignalContracts.js';
import { recommendationDefinitions } from './recommendations/reportRecommendationDefinitions.js';
import type {
  RecommendationContext,
  RecommendationDefinition,
  RecommendationEffort,
  RecommendationImpactLevel,
  RecommendationSeverity,
} from './recommendations/reportRecommendationTypes.js';

type ReportRecommendation = ProjectReport['recommendations'][number];

const recommendationSeverityOrder = {
  high: 0,
  medium: 1,
  low: 2,
} as const satisfies Record<RecommendationSeverity, number>;

const recommendationImpactOrder = {
  key: 0,
  important: 1,
  supporting: 2,
} as const satisfies Record<RecommendationImpactLevel, number>;

const recommendationEffortOrder = {
  small: 0,
  medium: 1,
  large: 2,
} as const satisfies Record<RecommendationEffort, number>;

export const reportRecommendationIds = recommendationDefinitions.map((definition) => definition.id);

const resolveSeverity = (
  definition: RecommendationDefinition,
  signals: RepositorySignals,
  context: RecommendationContext,
) => {
  return typeof definition.severity === 'function'
    ? definition.severity(signals, context)
    : definition.severity;
};

const createRecommendation = (
  definition: RecommendationDefinition,
  signals: RepositorySignals,
  context: RecommendationContext,
): ReportRecommendation => {
  const source = definition.getSource?.(signals);

  return {
    id: definition.id,
    severity: resolveSeverity(definition, signals, context),
    categories: [...definition.categories],
    checkIds: [...definition.checkIds],
    impactLevel: definition.impactLevel,
    effort: definition.effort,
    title: definition.title,
    description: definition.description,
    action: definition.action,
    ...(source ? { source } : {}),
  };
};

const sortRecommendationsByPriority = (
  recommendations: Array<{
    definitionIndex: number;
    recommendation: ReportRecommendation;
  }>,
) => {
  return recommendations
    .sort((left, right) => {
      const severityDiff =
        recommendationSeverityOrder[left.recommendation.severity] -
        recommendationSeverityOrder[right.recommendation.severity];
      const impactDiff =
        recommendationImpactOrder[left.recommendation.impactLevel] -
        recommendationImpactOrder[right.recommendation.impactLevel];
      const effortDiff =
        recommendationEffortOrder[left.recommendation.effort] -
        recommendationEffortOrder[right.recommendation.effort];

      return (
        severityDiff || impactDiff || effortDiff || left.definitionIndex - right.definitionIndex
      );
    })
    .map(({ recommendation }) => recommendation);
};

export const buildRecommendations = (
  signals: RepositorySignals,
  enabledCategories: readonly ScoreCategory[] = defaultEnabledScoreCategories,
) => {
  const enabledCategorySet = new Set(normalizeEnabledScoreCategories(enabledCategories));
  const context: RecommendationContext = {
    enabledCategorySet,
  };

  return sortRecommendationsByPriority(
    recommendationDefinitions.flatMap((definition, definitionIndex) => {
      if (!definition.categories.some((category) => enabledCategorySet.has(category))) {
        return [];
      }

      if (!definition.isApplicable(signals, context)) {
        return [];
      }

      return [
        {
          definitionIndex,
          recommendation: createRecommendation(definition, signals, context),
        },
      ];
    }),
  );
};
