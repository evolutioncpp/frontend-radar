import {
  createCheck,
  createMetric,
  createPathCheck,
  getScope,
} from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';
import type { ScoringCheck } from '../reportScoringEngine.js';

const getReadmePresenceCheck = (signals: RepositorySignals): ScoringCheck => {
  const max = 45;

  if (!signals.readme.exists) {
    return createCheck({
      description: 'README file was not found.',
      earned: 0,
      id: 'readme',
      label: 'README',
      max,
      scope: 'project',
      severity: 'critical',
      source: signals.readme.path ?? 'README',
      status: 'failed',
      confidence: 'high',
    });
  }

  if (
    signals.readme.scope === 'root' &&
    signals.isNestedProject &&
    !signals.readme.projectRelevance.found
  ) {
    return createCheck({
      description:
        'Root README was found, but it does not clearly document the selected frontend path.',
      earned: 20,
      id: 'readme',
      label: 'README',
      max,
      scope: 'root',
      severity: 'critical',
      source: signals.readme.path ?? 'README',
      status: 'partial',
      confidence: 'medium',
    });
  }

  return createCheck({
    earned: max,
    id: 'readme',
    label: 'README',
    max,
    scope: getScope(signals.readme.scope, 'project'),
    severity: 'critical',
    source: signals.readme.path ?? 'README',
    status: 'passed',
    confidence: signals.readme.scope === 'root' && signals.isNestedProject ? 'medium' : 'high',
  });
};

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
      getReadmePresenceCheck(signals),
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
