export { demoReport } from './model/demoReport';
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
  getCheckStatusLabel,
  getRecommendationSeverityBadgeVariant,
  getRecommendationSeverityLabel,
  getScoreStatusBadgeVariant,
  getScoreStatusLabel,
} from './model/statusMappers';
