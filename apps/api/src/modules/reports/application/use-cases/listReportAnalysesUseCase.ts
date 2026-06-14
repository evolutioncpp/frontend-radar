import { reportHistoryLimit } from '../../domain/reportAnalysisConfig.js';
import { success } from '../reportApplicationResponses.js';

import type { ReportApplicationServiceOptions } from '../reportApplicationServiceTypes.js';

export const createListReportAnalysesUseCase = ({
  repository,
}: Pick<ReportApplicationServiceOptions, 'repository'>) => {
  return async () => {
    const analyses = await repository.findLatest(reportHistoryLimit);

    return success(200, {
      items: analyses.map((analysis) => ({
        id: analysis.id,
        owner: analysis.owner,
        repository: analysis.repository,
        normalizedUrl: analysis.normalizedUrl,
        branch: analysis.branch,
        status: analysis.status,
        projectPath: analysis.projectPath || null,
        latestCommitDate: analysis.latestCommitDate,
        latestCommitSha: analysis.latestCommitSha,
        latestCommitTitle: analysis.latestCommitTitle,
        createdAt: analysis.createdAt.toISOString(),
        updatedAt: analysis.updatedAt.toISOString(),
        ...(analysis.report
          ? {
              checksCount: analysis.report.checks.length,
              metricsCount: analysis.report.scoreBreakdown.length,
              recommendationsCount: analysis.report.recommendations.length,
              score: analysis.report.totalScore,
            }
          : {}),
      })),
    });
  };
};
