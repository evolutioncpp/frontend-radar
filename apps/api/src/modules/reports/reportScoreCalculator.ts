import { buildAccessibilityScore } from './reportScoreAccessibility.js';
import { buildCiScore } from './reportScoreCi.js';
import { buildDependenciesScore } from './reportScoreDependencies.js';
import { buildDocumentationScore } from './reportScoreDocumentation.js';
import { buildMaintainabilityScore } from './reportScoreMaintainability.js';
import { buildPerformanceScore } from './reportScorePerformance.js';
import { getStatusByScore } from './reportScoreCheckBuilders.js';
import { buildTestingScore } from './reportScoreTesting.js';

import type { RepositorySignals } from './reportSignals.js';

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
