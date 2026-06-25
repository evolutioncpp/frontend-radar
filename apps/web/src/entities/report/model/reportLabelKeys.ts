import type {
  AnalysisSource,
  CheckStatus,
  RecommendationSeverity,
  ReportRecommendation,
  ScoreStatus,
  ToolingGroup,
} from './types';

export const reportScoreStatusLabelKeys = {
  critical: 'statuses.critical',
  excellent: 'statuses.excellent',
  good: 'statuses.good',
  warning: 'statuses.warning',
} as const satisfies Record<ScoreStatus, string>;

export const reportCheckStatusLabelKeys = {
  failed: 'statuses.failed',
  passed: 'statuses.passed',
  warning: 'statuses.warning',
} as const satisfies Record<CheckStatus, string>;

export const reportRecommendationSeverityLabelKeys = {
  high: 'statuses.high',
  low: 'statuses.low',
  medium: 'statuses.medium',
} as const satisfies Record<RecommendationSeverity, string>;

export const reportRecommendationImpactLabelKeys = {
  important: 'recommendations.impact.important',
  key: 'recommendations.impact.key',
  supporting: 'recommendations.impact.supporting',
} as const satisfies Record<ReportRecommendation['impactLevel'], string>;

export const reportRecommendationEffortLabelKeys = {
  large: 'recommendations.effort.large',
  medium: 'recommendations.effort.medium',
  small: 'recommendations.effort.small',
} as const satisfies Record<ReportRecommendation['effort'], string>;

export const reportRecommendationCategoryLabelKeys = {
  accessibility: 'recommendations.categories.accessibility',
  ci: 'recommendations.categories.ci',
  dependencies: 'recommendations.categories.dependencies',
  documentation: 'recommendations.categories.documentation',
  maintainability: 'recommendations.categories.maintainability',
  performance: 'recommendations.categories.performance',
  security: 'recommendations.categories.security',
  testing: 'recommendations.categories.testing',
} as const satisfies Record<ReportRecommendation['categories'][number], string>;

export const reportAnalysisSourceStatusLabelKeys = {
  found: 'analysisDetails.statuses.found',
  missing: 'analysisDetails.statuses.missing',
  warning: 'analysisDetails.statuses.warning',
} as const satisfies Record<AnalysisSource['status'], string>;

export const reportAnalysisSourceScopeLabelKeys = {
  github: 'analysisDetails.sources.scopes.github',
  project: 'analysisDetails.sources.scopes.project',
  repository: 'analysisDetails.sources.scopes.repository',
  root: 'analysisDetails.sources.scopes.root',
} as const satisfies Record<AnalysisSource['scope'], string>;

export const reportToolingGroupOrder = [
  'packageManager',
  'frameworks',
  'bundlers',
  'testing',
  'linting',
  'formatting',
  'typing',
  'uiReview',
  'accessibility',
] as const satisfies readonly ToolingGroup[];

export const reportToolingGroupLabelKeys = {
  accessibility: 'analysisDetails.tooling.groups.accessibility',
  bundlers: 'analysisDetails.tooling.groups.bundlers',
  formatting: 'analysisDetails.tooling.groups.formatting',
  frameworks: 'analysisDetails.tooling.groups.frameworks',
  linting: 'analysisDetails.tooling.groups.linting',
  packageManager: 'analysisDetails.tooling.groups.packageManager',
  testing: 'analysisDetails.tooling.groups.testing',
  typing: 'analysisDetails.tooling.groups.typing',
  uiReview: 'analysisDetails.tooling.groups.uiReview',
} as const satisfies Record<ToolingGroup, string>;
