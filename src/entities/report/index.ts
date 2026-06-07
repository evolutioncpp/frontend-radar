export { useDemoReport } from './model/demoReport';
export { getScoreStatus } from './model/getScoreStatus';
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
export type { ProjectReportState } from './model/useProjectReport';

export {
  getCheckStatusBadgeVariant,
  getRecommendationSeverityBadgeVariant,
  getScoreStatusBadgeVariant,
} from './model/statusMappers';
