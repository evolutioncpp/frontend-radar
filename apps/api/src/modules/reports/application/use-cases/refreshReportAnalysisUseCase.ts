import {
  isReportAnalyzerApiError,
  isReportProjectPathNotFoundError,
} from '../ports/reportAnalyzer.js';
import { isReportAnalysisAlreadyExistsError } from '../ports/reportAnalysisRepository.js';
import { createRefreshReusableAnalysisResponse } from '../reportAnalysisReuse.js';
import { createSnapshotLookup } from '../reportApplicationMappers.js';
import {
  createVerificationFailedError,
  localizedError,
  notFound,
  refreshUnavailable,
  success,
} from '../reportApplicationResponses.js';
import { REPORT_ANALYSIS_VERSION } from '../../domain/reportAnalysisConfig.js';

import type { ReportAnalyzerRequestContext } from '../ports/reportAnalyzer.js';
import type { ReportAnalysisEntity } from '../ports/reportAnalysisRepository.js';
import type {
  RefreshReportAnalysisResultBody,
  ReportApplicationServiceOptions,
} from '../reportApplicationServiceTypes.js';

export const createRefreshReportAnalysisUseCase = ({
  analyzer,
  repository,
  startAnalysis,
}: ReportApplicationServiceOptions) => {
  const reuseDeps = {
    repository,
    startAnalysis,
  };

  return async (id: string, context: ReportAnalyzerRequestContext = {}) => {
    const currentAnalysis = await repository.findById(id);

    if (!currentAnalysis) {
      return notFound();
    }

    if (currentAnalysis.status !== 'completed' || !currentAnalysis.report) {
      return refreshUnavailable();
    }

    let latestCommitDate: string | null = null;
    let latestCommitSha: string | null = null;
    let latestCommitTitle: string | null = null;
    let branch = currentAnalysis.branch;
    let analysisRef = currentAnalysis.branch || 'main';

    try {
      const snapshot = await analyzer.getRepositorySnapshot(
        currentAnalysis.owner,
        currentAnalysis.repository,
        currentAnalysis.branch,
        context,
      );

      branch = snapshot.branch;
      latestCommitDate = snapshot.latestCommitDate;
      latestCommitSha = snapshot.latestCommitSha;
      latestCommitTitle = snapshot.latestCommitTitle;
      analysisRef = latestCommitSha ?? snapshot.branch;

      await analyzer.resolveProjectPath(
        currentAnalysis.owner,
        currentAnalysis.repository,
        analysisRef,
        currentAnalysis.projectPath,
        currentAnalysis.projectPathSource,
        context,
      );
    } catch (error) {
      if (isReportProjectPathNotFoundError(error)) {
        return localizedError('project_path_not_found', 422);
      }

      if (isReportAnalyzerApiError(error)) {
        return localizedError(error.code);
      }

      return createVerificationFailedError({
        context: {
          error,
          id: currentAnalysis.id,
          owner: currentAnalysis.owner,
          repository: currentAnalysis.repository,
        },
        message: 'Failed to verify repository before report refresh',
      });
    }

    const snapshotLookup = createSnapshotLookup(
      currentAnalysis.repositoryKey,
      branch,
      currentAnalysis.projectPath,
      latestCommitDate,
      latestCommitSha,
      currentAnalysis.scoreCategoriesKey,
      currentAnalysis.isHistoryVisible,
    );

    if (snapshotLookup.snapshotKey === currentAnalysis.snapshotKey) {
      return success(200, {
        id: currentAnalysis.id,
        refreshReason: 'up_to_date',
        status: 'completed',
      } satisfies RefreshReportAnalysisResultBody);
    }

    const reusableAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

    if (reusableAnalysis) {
      return createRefreshReusableAnalysisResponse(reuseDeps, reusableAnalysis, context);
    }

    let newAnalysis: ReportAnalysisEntity;

    try {
      newAnalysis = await repository.create({
        analysisVersion: REPORT_ANALYSIS_VERSION,
        isHistoryVisible: currentAnalysis.isHistoryVisible,
        latestCommitDate,
        latestCommitSha,
        latestCommitTitle,
        normalizedUrl: currentAnalysis.normalizedUrl,
        owner: currentAnalysis.owner,
        branch,
        projectPath: currentAnalysis.projectPath,
        projectPathSource: currentAnalysis.projectPathSource,
        repository: currentAnalysis.repository,
        repositoryKey: currentAnalysis.repositoryKey,
        scoreCategoriesKey: currentAnalysis.scoreCategoriesKey,
        snapshotKey: snapshotLookup.snapshotKey,
      });
    } catch (error) {
      if (isReportAnalysisAlreadyExistsError(error)) {
        const concurrentAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

        if (concurrentAnalysis) {
          return createRefreshReusableAnalysisResponse(reuseDeps, concurrentAnalysis, context);
        }
      }

      throw error;
    }

    startAnalysis(newAnalysis, context);

    return success(201, {
      id: newAnalysis.id,
      refreshReason: 'created',
      status: 'queued',
    } satisfies RefreshReportAnalysisResultBody);
  };
};
