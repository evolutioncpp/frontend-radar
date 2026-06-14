import {
  buildCiSources,
  buildRepositoryPackageSources,
  buildScriptSources,
  buildSecuritySources,
  buildSourceCodeSources,
  buildToolingSources,
} from './reportAnalysisSourceGroups.js';

import type { ProjectReport } from '../../domain/reportSchemas.js';
import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

type AnalysisSource = ProjectReport['analysisSources'][number];

export const buildReportAnalysisSources = (
  signals: RepositorySignals,
  repository?: { name: string; owner: string },
): AnalysisSource[] => [
  ...buildRepositoryPackageSources(signals, repository),
  ...buildSecuritySources(signals),
  ...buildCiSources(signals),
  ...buildScriptSources(signals),
  ...buildSourceCodeSources(signals),
  ...buildToolingSources(signals),
];
