import { getGithubRepositoryKey } from '@frontend-radar/github-repository';

import {
  isReportAnalyzerApiError,
  isReportProjectPathNotFoundError,
} from '../ports/reportAnalyzer.js';
import { isReportAnalysisAlreadyExistsError } from '../ports/reportAnalysisRepository.js';
import { createReusableAnalysisResponse } from '../reportAnalysisReuse.js';
import { createSnapshotLookup, getProjectPathSource } from '../reportApplicationMappers.js';
import {
  createVerificationFailedError,
  localizedError,
  success,
} from '../reportApplicationResponses.js';
import {
  createScoreCategoriesKey,
  normalizeEnabledScoreCategories,
} from '../../domain/reportScoreCategories.js';

import type { ReportAnalyzerRequestContext } from '../ports/reportAnalyzer.js';
import type { ReportAnalysisEntity } from '../ports/reportAnalysisRepository.js';
import type {
  ReportApplicationServiceOptions,
  CreateReportAnalysisResultBody,
} from '../reportApplicationServiceTypes.js';
import type { CreateReportAnalysisRequest } from '../../domain/reportSchemas.js';

export const createCreateReportAnalysisUseCase = ({
  analyzer,
  repository,
  startAnalysis,
}: ReportApplicationServiceOptions) => {
  const reuseDeps = {
    repository,
    startAnalysis,
  };

  return async (
    request: CreateReportAnalysisRequest,
    context: ReportAnalyzerRequestContext = {},
  ) => {
    const repositoryKey = getGithubRepositoryKey(request.owner, request.repository);
    let latestCommitDate: string | null = null;
    let latestCommitSha: string | null = null;
    let latestCommitTitle: string | null = null;
    let branch = '';
    let projectPath = '';
    const projectPathSource = getProjectPathSource(request);
    const enabledScoreCategories = normalizeEnabledScoreCategories(request.enabledScoreCategories);
    const scoreCategoriesKey = createScoreCategoriesKey(enabledScoreCategories);
    const isHistoryVisible = request.saveToHistory ?? true;
    let analysisRef = 'main';

    try {
      const snapshot = await analyzer.getRepositorySnapshot(
        request.owner,
        request.repository,
        request.branch,
        context,
      );

      branch = snapshot.branch;
      latestCommitDate = snapshot.latestCommitDate;
      latestCommitSha = snapshot.latestCommitSha;
      latestCommitTitle = snapshot.latestCommitTitle;
      analysisRef = latestCommitSha ?? snapshot.branch;
      projectPath = await analyzer.resolveProjectPath(
        request.owner,
        request.repository,
        analysisRef,
        request.projectPath,
        request.projectPathSource,
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
          owner: request.owner,
          repository: request.repository,
        },
        message: 'Failed to verify repository before analysis',
      });
    }

    const snapshotLookup = createSnapshotLookup(
      repositoryKey,
      branch,
      projectPath,
      latestCommitDate,
      latestCommitSha,
      scoreCategoriesKey,
      isHistoryVisible,
    );
    const reusableAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

    if (reusableAnalysis) {
      return createReusableAnalysisResponse(reuseDeps, reusableAnalysis, context);
    }

    let analysis: ReportAnalysisEntity;

    try {
      analysis = await repository.create({
        ...snapshotLookup,
        branch,
        isHistoryVisible,
        latestCommitDate,
        latestCommitSha,
        latestCommitTitle,
        normalizedUrl: request.normalizedUrl,
        owner: request.owner,
        projectPath,
        projectPathSource,
        repository: request.repository,
        scoreCategoriesKey,
      });
    } catch (error) {
      if (isReportAnalysisAlreadyExistsError(error)) {
        const concurrentAnalysis = await repository.findReusableBySnapshot(snapshotLookup);

        if (concurrentAnalysis) {
          return createReusableAnalysisResponse(reuseDeps, concurrentAnalysis, context);
        }
      }

      throw error;
    }

    startAnalysis(analysis, context);

    return success(201, {
      id: analysis.id,
      reuseReason: null,
      status: 'queued',
    } satisfies CreateReportAnalysisResultBody);
  };
};
