import { normalizeSupportedLanguage } from '@frontend-radar/localization';

import { reportAnalysisSourceIds } from './reportAnalysisSources.js';
import { reportLocalizationAnalysisSources } from './reportLocalizationAnalysisSources.js';
import { reportLocalizationChecks } from './reportLocalizationChecks.js';
import { reportLocalizationErrors } from './reportLocalizationErrors.js';
import { reportLocalizationMetrics } from './reportLocalizationMetrics.js';
import { reportLocalizationMisc } from './reportLocalizationMisc.js';
import { reportLocalizationProjectDetection } from './reportLocalizationProjectDetection.js';
import { reportLocalizationRecommendations } from './reportLocalizationRecommendations.js';
import { reportLocalizationScoreCaps } from './reportLocalizationScoreCaps.js';
import { reportLocalizationScoreChecks } from './reportLocalizationScoreChecks.js';
import { reportProjectDetectionSignalIds } from './reportProjectDetector.js';
import { reportScoreCheckIds } from './reportScoreCheckIds.js';

import type {
  AnalysisSourceId,
  ProjectDetectionSignalId,
  ReportLocalizationCatalog,
  SignalStatus,
} from './reportLocalizationCatalogTypes.js';
import type { ReportScoreCheckId } from './reportScoreCheckIds.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export type { ReportLocalizationCatalog, SignalStatus };

export const reportLocalizationCatalogs: Record<SupportedLanguage, ReportLocalizationCatalog> = {
  en: {
    analysisSources: reportLocalizationAnalysisSources.en,
    checks: reportLocalizationChecks.en,
    errors: reportLocalizationErrors.en,
    scoreChecks: reportLocalizationScoreChecks.en,
    metrics: reportLocalizationMetrics.en,
    scoreCaps: reportLocalizationScoreCaps.en,
    projectDetection: reportLocalizationProjectDetection.en,
    toolingNotDetected: reportLocalizationMisc.en.toolingNotDetected,
    recommendations: reportLocalizationRecommendations.en,
    reportNotFound: reportLocalizationMisc.en.reportNotFound,
    reportRefreshUnavailable: reportLocalizationMisc.en.reportRefreshUnavailable,
  },
  ru: {
    analysisSources: reportLocalizationAnalysisSources.ru,
    checks: reportLocalizationChecks.ru,
    errors: reportLocalizationErrors.ru,
    scoreChecks: reportLocalizationScoreChecks.ru,
    metrics: reportLocalizationMetrics.ru,
    scoreCaps: reportLocalizationScoreCaps.ru,
    projectDetection: reportLocalizationProjectDetection.ru,
    toolingNotDetected: reportLocalizationMisc.ru.toolingNotDetected,
    recommendations: reportLocalizationRecommendations.ru,
    reportNotFound: reportLocalizationMisc.ru.reportNotFound,
    reportRefreshUnavailable: reportLocalizationMisc.ru.reportRefreshUnavailable,
  },
};

export const getCatalog = (language: SupportedLanguage) => {
  return reportLocalizationCatalogs[normalizeSupportedLanguage(language)];
};

export const isReportScoreCheckId = (id: string): id is ReportScoreCheckId => {
  return (reportScoreCheckIds as readonly string[]).includes(id);
};

export const isProjectDetectionSignalId = (id: string): id is ProjectDetectionSignalId => {
  return (reportProjectDetectionSignalIds as readonly string[]).includes(id);
};

export const isAnalysisSourceId = (id: string): id is AnalysisSourceId => {
  return (reportAnalysisSourceIds as readonly string[]).includes(id);
};
