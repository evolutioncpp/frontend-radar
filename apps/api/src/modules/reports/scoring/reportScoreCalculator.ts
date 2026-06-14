import { buildAccessibilityScore } from './categories/reportScoreAccessibility.js';
import { buildCiScore } from './categories/reportScoreCi.js';
import { buildDependenciesScore } from './categories/reportScoreDependencies.js';
import { buildDocumentationScore } from './categories/reportScoreDocumentation.js';
import { buildMaintainabilityScore } from './categories/reportScoreMaintainability.js';
import { buildPerformanceScore } from './categories/reportScorePerformance.js';
import { buildSecurityScore } from './categories/reportScoreSecurity.js';
import { getStatusByScore } from './reportScoreCheckBuilders.js';
import { buildTestingScore } from './categories/reportScoreTesting.js';
import {
  defaultEnabledScoreCategories,
  normalizeEnabledScoreCategories,
} from '../domain/reportScoreCategories.js';

import type { ProjectReport, ScoreCategory } from '../domain/reportSchemas.js';
import type { RepositorySignals } from '../domain/reportSignalContracts.js';

export { getStatusByScore };

const scoreCategoryBuilders = {
  documentation: buildDocumentationScore,
  testing: buildTestingScore,
  ci: buildCiScore,
  dependencies: buildDependenciesScore,
  security: buildSecurityScore,
  maintainability: buildMaintainabilityScore,
  performance: buildPerformanceScore,
  accessibility: buildAccessibilityScore,
} as const satisfies Record<
  ScoreCategory,
  (signals: RepositorySignals) => ProjectReport['scoreBreakdown'][number]
>;

export const buildScoreBreakdown = (
  signals: RepositorySignals,
  enabledCategories: readonly ScoreCategory[] = defaultEnabledScoreCategories,
) => {
  return normalizeEnabledScoreCategories(enabledCategories).map((category) =>
    scoreCategoryBuilders[category](signals),
  );
};
