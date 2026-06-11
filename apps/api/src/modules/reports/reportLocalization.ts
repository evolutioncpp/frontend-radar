import type { ProjectReport, ReportAnalysisErrorCode } from './reportSchemas.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

import {
  getCatalog,
  isAnalysisSourceId,
  isProjectDetectionSignalId,
  isReportScoreCheckId,
  type ReportLocalizationCatalog,
  type SignalStatus,
} from './reportLocalizationCatalogs.js';

export const getLocalizedReportErrorMessage = (
  code: ReportAnalysisErrorCode,
  language: SupportedLanguage,
) => {
  return getCatalog(language).errors[code];
};

export const getLocalizedReportNotFoundMessage = (language: SupportedLanguage) => {
  return getCatalog(language).reportNotFound;
};

export const getLocalizedReportRefreshUnavailableMessage = (language: SupportedLanguage) => {
  return getCatalog(language).reportRefreshUnavailable;
};

const localizeScoreDetails = (
  scoreDetails: ProjectReport['scoreBreakdown'][number]['scoreDetails'] | undefined,
  catalog: ReportLocalizationCatalog,
  fallbackValue: number,
) => {
  const details = scoreDetails ?? {
    rawValue: fallbackValue,
    finalValue: fallbackValue,
    weight: 1,
    impactLevel: 'supporting' as const,
    checks: [],
  };

  return {
    ...details,
    ...(details.cap
      ? {
          cap: {
            ...details.cap,
            reason: catalog.scoreCaps[details.cap.reason] ?? details.cap.reason,
          },
        }
      : {}),
    checks: details.checks.map((check) => {
      const translation = isReportScoreCheckId(check.id)
        ? catalog.scoreChecks[check.id]
        : undefined;
      const signalStatus: SignalStatus =
        check.status === 'passed'
          ? 'found'
          : check.status === 'failed' || check.status === 'not_applicable'
            ? 'missing'
            : 'warning';
      const description = translation?.descriptions[signalStatus] ?? check.description;

      return {
        ...check,
        label: translation?.label ?? check.label,
        ...(description ? { description } : {}),
      };
    }),
  };
};

const localizeProjectDetection = (
  projectDetection: ProjectReport['repository']['projectDetection'],
  catalog: ReportLocalizationCatalog,
) => {
  return {
    ...projectDetection,
    signals: projectDetection.signals.map((signal) => {
      const translation = isProjectDetectionSignalId(signal.id)
        ? catalog.projectDetection[signal.id]
        : undefined;
      const description = translation?.descriptions[signal.status] ?? signal.description;

      return {
        ...signal,
        label: translation?.label ?? signal.label,
        ...(description ? { description } : {}),
      };
    }),
  };
};

const localizeAnalysisSources = (
  analysisSources: ProjectReport['analysisSources'],
  catalog: ReportLocalizationCatalog,
  repository: ProjectReport['repository'],
) => {
  return analysisSources.map((source) => {
    const translation = isAnalysisSourceId(source.id)
      ? catalog.analysisSources[source.id]
      : undefined;
    const description = translation?.descriptions[source.status] ?? source.description;
    const sourceValue =
      source.id === 'github-repository-metadata'
        ? `GET /repos/${repository.owner}/${repository.name}`
        : source.source;

    return {
      ...source,
      label: translation?.label ?? source.label,
      ...(sourceValue ? { source: sourceValue } : {}),
      ...(description ? { description } : {}),
    };
  });
};

const localizeTooling = (tooling: ProjectReport['tooling'], catalog: ReportLocalizationCatalog) => {
  return Object.fromEntries(
    Object.entries(tooling).map(([group, items]) => [
      group,
      items.map((item) => ({
        ...item,
        label: item.status === 'missing' ? catalog.toolingNotDetected : item.label,
      })),
    ]),
  ) as ProjectReport['tooling'];
};

export const localizeProjectReport = (
  report: ProjectReport,
  language: SupportedLanguage,
): ProjectReport => {
  const catalog = getCatalog(language);

  return {
    ...report,
    analysisSources: localizeAnalysisSources(report.analysisSources, catalog, report.repository),
    repository: {
      ...report.repository,
      projectDetection: localizeProjectDetection(report.repository.projectDetection, catalog),
    },
    tooling: localizeTooling(report.tooling, catalog),
    checks: report.checks.map((check) => {
      const translation = catalog.checks[check.id];
      const description = check.description
        ? (translation?.description ?? check.description)
        : undefined;

      return {
        ...check,
        label: translation?.label ?? check.label,
        ...(description ? { description } : {}),
      };
    }),
    recommendations: report.recommendations.map((recommendation) => {
      const translation = catalog.recommendations[recommendation.id];

      return {
        ...recommendation,
        title: translation?.title ?? recommendation.title,
        description: translation?.description ?? recommendation.description,
      };
    }),
    scoreBreakdown: report.scoreBreakdown.map((metric) => {
      const translation = catalog.metrics[metric.category];

      return {
        ...metric,
        scoreDetails: localizeScoreDetails(metric.scoreDetails, catalog, metric.value),
        label: translation?.label ?? metric.label,
        description: translation?.description ?? metric.description,
      };
    }),
  };
};
