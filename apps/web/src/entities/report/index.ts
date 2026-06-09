export { useDemoReport } from './model/demoReport';
export { getScoreStatus } from './model/getScoreStatus';
export {
  useGetReportAnalysisQuery,
  useLazyGetReportAnalysisQuery,
  useLazyListReportAnalysesQuery,
  useListReportAnalysesQuery,
} from './model/reportApi';
export {
  getReportHistoryItemViewModel,
  isReportProcessing,
  isReportTerminal,
} from './model/reportSelectors';
export { useReportHistory } from './model/useReportHistory';
export { useProjectReport } from './model/useProjectReport';

export type {
  CheckStatus,
  ProjectReport,
  RecommendationSeverity,
  ReportCheck,
  ReportRecommendation,
  ReportRepository,
  ScoreBreakdownItem,
  ScoreCategory,
  ScoreStatus,
} from './model/types';
export type { ReportAnalysisStatus } from './model/reportSelectors';
export type { ProjectReportState } from './model/useProjectReport';
export type {
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
