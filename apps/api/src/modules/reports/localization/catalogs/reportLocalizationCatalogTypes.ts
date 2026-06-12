import {
  reportAnalysisSourceIds,
  reportProjectDetectionSignalIds,
} from '../../domain/reportSignalContracts.js';

import type { ProjectReport, ReportAnalysisErrorCode } from '../../domain/reportSchemas.js';
import type { ReportScoreCheckId } from '../../scoring/reportScoreCheckIds.js';

type ScoreCategory = ProjectReport['scoreBreakdown'][number]['category'];
export type SignalStatus = 'found' | 'missing' | 'warning';
type ProjectDetectionSignalStatus =
  ProjectReport['repository']['projectDetection']['signals'][number]['status'];
export type ProjectDetectionSignalId = (typeof reportProjectDetectionSignalIds)[number];
export type AnalysisSourceId = (typeof reportAnalysisSourceIds)[number];

export type ReportLocalizationCatalog = {
  analysisSources: Record<
    AnalysisSourceId,
    {
      label: string;
      descriptions: Partial<Record<SignalStatus, string>>;
    }
  >;
  checks: Record<string, { label: string; description?: string }>;
  errors: Record<ReportAnalysisErrorCode, string>;
  scoreChecks: Record<
    ReportScoreCheckId,
    {
      label: string;
      descriptions: Partial<Record<SignalStatus, string>>;
    }
  >;
  metrics: Record<ScoreCategory, { label: string; description: string }>;
  scoreCaps: Record<string, string>;
  projectDetection: Record<
    ProjectDetectionSignalId,
    {
      label: string;
      descriptions: Partial<Record<ProjectDetectionSignalStatus, string>>;
    }
  >;
  toolingNotDetected: string;
  recommendations: Record<string, { title: string; description: string }>;
  reportNotFound: string;
  reportRefreshUnavailable: string;
};
