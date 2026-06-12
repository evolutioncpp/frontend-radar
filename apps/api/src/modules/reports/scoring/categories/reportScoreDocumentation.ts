import {
  createCheck,
  createMetric,
  createPathCheck,
  getScope,
} from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../analysis/signals/reportSignals.js';
import type { ScoringCheck } from '../reportScoringEngine.js';

const getReadmeQualityCheck = (signals: RepositorySignals): ScoringCheck => {
  if (!signals.readme.exists) {
    return createCheck({
      description: 'README quality could not be evaluated because README was not found.',
      earned: 0,
      id: 'readme-quality',
      label: 'README quality',
      max: 35,
      scope: 'project',
      severity: 'major',
      source: 'README',
      status: 'failed',
      confidence: 'high',
    });
  }

  const earned =
    (signals.readme.isSubstantial ? 15 : 0) +
    (signals.readme.hasInstallSection ? 10 : 0) +
    (signals.readme.hasUsageSection ? 10 : 0);

  return createCheck({
    description:
      earned === 35
        ? undefined
        : 'README was found, but it is short or misses setup and usage details.',
    earned,
    id: 'readme-quality',
    label: 'README quality',
    max: 35,
    scope: getScope(signals.readme.scope, 'project'),
    severity: 'major',
    source: signals.readme.path ?? 'README',
    status: earned === 35 ? 'passed' : 'partial',
    confidence: 'high',
  });
};

export const buildDocumentationScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'documentation',
    label: 'Documentation',
    description: 'README and environment documentation signals found in the repository.',
    checks: [
      createPathCheck({
        id: 'readme',
        label: 'README',
        max: 45,
        missingDescription: 'README file was not found.',
        partialDescription: 'Only a root README was found for this nested frontend project.',
        partialEarned: 20,
        severity: 'critical',
        signal: signals.readme,
        signals,
      }),
      getReadmeQualityCheck(signals),
      createPathCheck({
        id: 'env-example',
        label: 'Environment example',
        max: 20,
        missingDescription: 'No environment example file was found.',
        partialDescription: 'Only a root environment example was found for this nested project.',
        partialEarned: 8,
        severity: 'minor',
        signal: signals.envExample,
        signals,
      }),
    ],
  });
