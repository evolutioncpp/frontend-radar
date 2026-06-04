export { useDemoReport } from './model/demoReport';
export { getScoreStatus } from './model/getScoreStatus';

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

export {
  getCheckStatusBadgeVariant,
  getRecommendationSeverityBadgeVariant,
  getScoreStatusBadgeVariant,
} from './model/statusMappers';
