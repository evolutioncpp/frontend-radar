import type { ReportAnalyzer } from './githubReportAnalyzer.js';
import { getReportAnalysisFailure } from './githubReportAnalyzer.js';
import type { ReportAnalysisEntity, ReportAnalysisRepository } from './reportAnalysisRepository.js';

interface StartReportAnalysisOptions {
  analysis: ReportAnalysisEntity;
  analyzer: ReportAnalyzer;
  logger: {
    error: (value: unknown, message?: string) => void;
  };
  repository: ReportAnalysisRepository;
}

export const startReportAnalysis = async ({
  analysis,
  analyzer,
  logger,
  repository,
}: StartReportAnalysisOptions) => {
  try {
    await repository.updateStatus(analysis.id, 'running');
    const report = await analyzer.analyze(analysis);

    await repository.complete(analysis.id, report);
  } catch (error) {
    await repository.fail(analysis.id, getReportAnalysisFailure(error));
    logger.error(
      {
        analysisId: analysis.id,
        error,
      },
      'Report analysis failed',
    );
  }
};

export const recoverReportAnalyses = async ({
  analyzer,
  logger,
  repository,
}: Omit<StartReportAnalysisOptions, 'analysis'>) => {
  const analyses = await repository.findRecoverable();

  for (const analysis of analyses) {
    void startReportAnalysis({
      analysis,
      analyzer,
      logger,
      repository,
    });
  }
};
