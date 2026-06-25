export { getScoreStatus } from './model/getScoreStatus';
export {
  useGetReportComparisonQuery,
  useLazyGetReportComparisonQuery,
  useGetReportAnalysisQuery,
  useLazyGetReportAnalysisQuery,
  useLazyListReportAnalysesQuery,
  useListReportAnalysesQuery,
  invalidateReportsCache,
} from './model/reportApi';
export {
  getReportHistoryGroupsViewModel,
  getReportHistoryItemViewModel,
  isReportProcessing,
  isReportTerminal,
} from './model/reportSelectors';
export { useReportHistory } from './model/useReportHistory';
export { useReportComparison } from './model/useReportComparison';
export { useProjectReport } from './model/useProjectReport';
export { ReportScoreDetailsList } from './ui/report-score-details-list/ReportScoreDetailsList';

export type {
  AnalysisSource,
  AnalysisSourceKind,
  AnalysisSourceScope,
  CheckStatus,
  ProjectReport,
  RecommendationSeverity,
  ReportCheck,
  ReportRecommendation,
  ReportRepository,
  ReportSignal,
  ReportSignalStatus,
  ReportTooling,
  ReportAnalysisStatus,
  ScoreCap,
  ScoreBreakdownItem,
  ScoreCategory,
  ScoreDetails,
  ScoreStatus,
  ScoringCheck,
  ScoringCheckConfidence,
  ScoringCheckScope,
  ScoringCheckSeverity,
  ScoringCheckStatus,
  ToolingItem,
  ToolingGroup,
  ToolingSource,
  ToolingSourceKind,
  ToolingSourceSection,
  UnavailableReportComparison,
} from './model/types';
export type {
  ReportHistoryGroupViewModel,
  ReportHistoryItemViewModel,
} from './model/reportSelectors';
export type { ProjectReportState } from './model/useProjectReport';
export type { ReportComparisonState } from './model/useReportComparison';
export type {
  GetReportComparisonApiArg,
  GetReportComparisonApiResponse,
  GetReportAnalysisApiArg,
  GetReportAnalysisApiResponse,
  ListReportAnalysesApiArg,
  ListReportAnalysesApiResponse,
} from './model/reportApi';

export {
  reportAnalysisSourceScopeLabelKeys,
  reportAnalysisSourceStatusLabelKeys,
  reportCheckStatusLabelKeys,
  reportRecommendationCategoryLabelKeys,
  reportRecommendationEffortLabelKeys,
  reportRecommendationImpactLabelKeys,
  reportRecommendationSeverityLabelKeys,
  reportScoreStatusLabelKeys,
  reportToolingGroupLabelKeys,
  reportToolingGroupOrder,
} from './model/reportLabelKeys';
export {
  getCheckStatusBadgeVariant,
  getRecommendationSeverityBadgeVariant,
  getScoreStatusBadgeVariant,
} from './model/statusMappers';
