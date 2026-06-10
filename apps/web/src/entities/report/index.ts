export { getScoreStatus } from './model/getScoreStatus';
export {
  useGetReportComparisonQuery,
  useLazyGetReportComparisonQuery,
  useGetReportAnalysisQuery,
  useLazyGetReportAnalysisQuery,
  useLazyListReportAnalysesQuery,
  useListReportAnalysesQuery,
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
export { ReportEvidenceList } from './ui/report-evidence-list/ReportEvidenceList';

export type {
  CheckStatus,
  ProjectReport,
  RecommendationSeverity,
  ReportCheck,
  ReportEvidence,
  ReportEvidenceStatus,
  ReportRecommendation,
  ReportRepository,
  ScoreBreakdownItem,
  ScoreCategory,
  ScoreStatus,
} from './model/types';
export type { ReportAnalysisStatus } from './model/reportSelectors';
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
  getCheckStatusBadgeVariant,
  getRecommendationSeverityBadgeVariant,
  getScoreStatusBadgeVariant,
} from './model/statusMappers';
