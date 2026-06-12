import { buildAccessibilityScore } from './categories/reportScoreAccessibility.js';
import { buildCiScore } from './categories/reportScoreCi.js';
import { buildDependenciesScore } from './categories/reportScoreDependencies.js';
import { buildDocumentationScore } from './categories/reportScoreDocumentation.js';
import { buildMaintainabilityScore } from './categories/reportScoreMaintainability.js';
import { buildPerformanceScore } from './categories/reportScorePerformance.js';
import { getStatusByScore } from './reportScoreCheckBuilders.js';
import { buildTestingScore } from './categories/reportScoreTesting.js';

import type { RepositorySignals } from '../domain/reportSignalContracts.js';

export { getStatusByScore };

export const buildScoreBreakdown = (signals: RepositorySignals) => [
  buildDocumentationScore(signals),
  buildTestingScore(signals),
  buildCiScore(signals),
  buildDependenciesScore(signals),
  buildMaintainabilityScore(signals),
  buildPerformanceScore(signals),
  buildAccessibilityScore(signals),
];
