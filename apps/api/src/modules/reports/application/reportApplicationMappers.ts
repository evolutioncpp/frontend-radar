import { REPORT_ANALYSIS_VERSION } from '../domain/reportAnalysisConfig.js';
import { createReportAnalysisSnapshotKey } from '../domain/reportAnalysisSnapshot.js';

import type {
  ReportAnalysisEntity,
  ReportAnalysisSnapshotLookup,
} from './ports/reportAnalysisRepository.js';
import type {
  CreateReportAnalysisRequest,
  GetReportAnalysisResponse,
  ReportComparisonUnavailableReason,
} from '../domain/reportSchemas.js';

export type ReportAnalysisProcessingSummary = Extract<
  GetReportAnalysisResponse,
  { status: 'queued' | 'running' }
>['analysis'];

export const createReportAnalysisProcessingSummary = (
  analysis: ReportAnalysisEntity,
): ReportAnalysisProcessingSummary => ({
  owner: analysis.owner,
  repository: analysis.repository,
  normalizedUrl: analysis.normalizedUrl,
  branch: analysis.branch,
  projectPath: analysis.projectPath || null,
  latestCommitDate: analysis.latestCommitDate,
  latestCommitSha: analysis.latestCommitSha,
  latestCommitTitle: analysis.latestCommitTitle,
  progress: {
    stage: analysis.progressStage,
    updatedAt: analysis.progressUpdatedAt.toISOString(),
  },
  startedAt: analysis.startedAt?.toISOString() ?? null,
  createdAt: analysis.createdAt.toISOString(),
  updatedAt: analysis.updatedAt.toISOString(),
});

export const createSnapshotLookup = (
  repositoryKey: string,
  branch: string,
  projectPath: string,
  latestCommitDate: string | null,
  latestCommitSha: string | null,
  scoreCategoriesKey: string,
  isHistoryVisible: boolean,
): ReportAnalysisSnapshotLookup => {
  return {
    analysisVersion: REPORT_ANALYSIS_VERSION,
    branch,
    isHistoryVisible,
    projectPath,
    repositoryKey,
    scoreCategoriesKey,
    snapshotKey: createReportAnalysisSnapshotKey({
      latestCommitDate,
      latestCommitSha,
    }),
  };
};

export const getProjectPathSource = ({
  projectPath,
  projectPathSource,
}: Pick<CreateReportAnalysisRequest, 'projectPath' | 'projectPathSource'>) => {
  if (!projectPath) {
    return 'autodetect' as const;
  }

  return projectPathSource ?? 'manual';
};

export const getComparisonUnavailableReason = (
  currentAnalysis: ReportAnalysisEntity,
  previousAnalysis: ReportAnalysisEntity | null,
): ReportComparisonUnavailableReason | undefined => {
  if (!previousAnalysis) {
    return 'not_found';
  }

  if (previousAnalysis.id === currentAnalysis.id) {
    return 'same_report';
  }

  if (previousAnalysis.status !== 'completed' || !previousAnalysis.report) {
    return 'not_completed';
  }

  if (previousAnalysis.repositoryKey !== currentAnalysis.repositoryKey) {
    return 'different_repository';
  }

  if (previousAnalysis.projectPath !== currentAnalysis.projectPath) {
    return 'different_project_path';
  }

  if (previousAnalysis.branch !== currentAnalysis.branch) {
    return 'different_branch';
  }

  if (previousAnalysis.scoreCategoriesKey !== currentAnalysis.scoreCategoriesKey) {
    return 'different_score_categories';
  }

  return undefined;
};
