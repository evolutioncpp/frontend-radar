import type {
  GetReportAnalysisApiResponse,
  GetReportComparisonApiResponse,
  ListReportAnalysesApiResponse,
} from './reportApi';

export type CompletedReportAnalysisResponse = Extract<
  GetReportAnalysisApiResponse,
  {
    status: 'completed';
  }
>;

export type FailedReportAnalysisResponse = Extract<
  GetReportAnalysisApiResponse,
  {
    status: 'failed';
  }
>;

export type ProcessingReportAnalysisResponse = Extract<
  GetReportAnalysisApiResponse,
  {
    status: 'queued' | 'running';
  }
>;

export type AvailableReportComparison = Extract<
  GetReportComparisonApiResponse,
  {
    status: 'available';
  }
>;

export type UnavailableReportComparison = Extract<
  GetReportComparisonApiResponse,
  {
    status: 'unavailable';
  }
>;

export type ProjectReport = CompletedReportAnalysisResponse['report'];
export type ReportRepository = ProjectReport['repository'];
export type ProjectDetection = ReportRepository['projectDetection'];
export type ProjectPathSource = ProjectDetection['source'];
export type ProjectDetectionConfidence = ProjectDetection['confidence'];
export type ReportSignal = ProjectDetection['signals'][number];
export type ReportSignalStatus = ReportSignal['status'];

export type AnalysisSource = ProjectReport['analysisSources'][number];
export type AnalysisSourceKind = AnalysisSource['kind'];
export type AnalysisSourceScope = AnalysisSource['scope'];

export type ReportTooling = ProjectReport['tooling'];
export type ToolingGroup = keyof ReportTooling;
export type ToolingItem = ReportTooling[ToolingGroup][number];
export type ToolingSource = ToolingItem['sources'][number];
export type ToolingSourceKind = ToolingSource['kind'];
export type ToolingSourceSection = NonNullable<ToolingSource['section']>;

export type ScoreBreakdownItem = ProjectReport['scoreBreakdown'][number];
export type ScoreCategory = ScoreBreakdownItem['category'];
export type ScoreStatus = ScoreBreakdownItem['status'];
export type ScoreDetails = ScoreBreakdownItem['scoreDetails'];
export type ScoreCap = NonNullable<ScoreDetails['cap']>;
export type ScoringCheck = ScoreDetails['checks'][number];
export type ScoringCheckStatus = ScoringCheck['status'];
export type ScoringCheckSeverity = ScoringCheck['severity'];
export type ScoringCheckScope = ScoringCheck['scope'];
export type ScoringCheckConfidence = ScoringCheck['confidence'];

export type ReportCheck = ProjectReport['checks'][number];
export type CheckStatus = ReportCheck['status'];
export type ReportRecommendation = ProjectReport['recommendations'][number];
export type RecommendationSeverity = ReportRecommendation['severity'];

export type ReportHistoryItem = ListReportAnalysesApiResponse['items'][number];
export type ReportAnalysisStatus = ReportHistoryItem['status'];
