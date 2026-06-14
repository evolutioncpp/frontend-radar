import type { ProjectReport, ScoreCategory } from '../reportSchemas.js';
import type { RepositorySignals } from '../reportSignalContracts.js';
import type { ReportScoreCheckId } from '../reportScoreCheckContracts.js';

type ReportRecommendation = ProjectReport['recommendations'][number];

export type RecommendationSeverity = ReportRecommendation['severity'];
export type RecommendationImpactLevel = ReportRecommendation['impactLevel'];
export type RecommendationEffort = ReportRecommendation['effort'];

export type RecommendationContext = {
  enabledCategorySet: ReadonlySet<ScoreCategory>;
};

export type RecommendationDefinition = {
  id: string;
  severity:
    | RecommendationSeverity
    | ((signals: RepositorySignals, context: RecommendationContext) => RecommendationSeverity);
  categories: readonly ScoreCategory[];
  checkIds: readonly ReportScoreCheckId[];
  impactLevel: RecommendationImpactLevel;
  effort: RecommendationEffort;
  title: string;
  description: string;
  action: string;
  isApplicable: (signals: RepositorySignals, context: RecommendationContext) => boolean;
  getSource?: (signals: RepositorySignals) => string | undefined;
};
