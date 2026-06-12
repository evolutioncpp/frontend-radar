import { scoreCategoryWeights, scoreThresholds } from '../domain/reportAnalysisConfig.js';
import { calculateCategoryScore } from './reportScoringEngine.js';

import type { ProjectReport } from '../domain/reportSchemas.js';
import type {
  PathSignal,
  RepositorySignals,
  ScriptSignal,
  SignalScope,
  ToolSignal,
} from '../domain/reportSignalContracts.js';
import type { ReportScoreCheckId } from './reportScoreCheckIds.js';
import type { ScoringCheck } from './reportScoringEngine.js';

export type ScoreCategory = ProjectReport['scoreBreakdown'][number]['category'];
export type ScoreBreakdownItem = ProjectReport['scoreBreakdown'][number];
type ScoringScope = ScoringCheck['scope'];
type InternalScoringCheck = Omit<ScoringCheck, 'id'> & {
  id: ReportScoreCheckId;
};

const scopeBySignalScope = {
  github: 'github',
  project: 'project',
  root: 'root',
} as const satisfies Record<Exclude<SignalScope, null>, ScoringScope>;

export const getScope = (scope: SignalScope | undefined, fallback: ScoringScope): ScoringScope => {
  return scope ? scopeBySignalScope[scope] : fallback;
};

const getScoreStatusByValue = (score: number) => {
  if (score >= scoreThresholds.excellent) {
    return 'excellent' as const;
  }

  if (score >= scoreThresholds.good) {
    return 'good' as const;
  }

  if (score >= scoreThresholds.warning) {
    return 'warning' as const;
  }

  return 'critical' as const;
};

export const getStatusByScore = getScoreStatusByValue;

export const createCheck = ({
  confidence = 'high',
  description,
  earned,
  id,
  label,
  max,
  scope,
  severity,
  source,
  status,
}: InternalScoringCheck): ScoringCheck => ({
  confidence,
  earned,
  id,
  label,
  max,
  scope,
  severity,
  status,
  ...(description ? { description } : {}),
  ...(source ? { source } : {}),
});

export const createPathCheck = ({
  description,
  id,
  label,
  max,
  missingDescription,
  partialDescription,
  partialEarned,
  severity,
  signal,
  signals,
}: {
  description?: string;
  id: ReportScoreCheckId;
  label: string;
  max: number;
  missingDescription: string;
  partialDescription?: string;
  partialEarned: number;
  severity: ScoringCheck['severity'];
  signal: PathSignal;
  signals: RepositorySignals;
}): ScoringCheck => {
  if (!signal.exists) {
    return createCheck({
      description: missingDescription,
      earned: 0,
      id,
      label,
      max,
      scope: 'project',
      severity,
      source: signal.path ?? label,
      status: 'failed',
      confidence: 'high',
    });
  }

  if (signal.scope === 'root' && signals.isNestedProject) {
    return createCheck({
      description: partialDescription ?? 'Only a root-level monorepo signal was found.',
      earned: partialEarned,
      id,
      label,
      max,
      scope: 'root',
      severity,
      source: signal.path ?? label,
      status: 'partial',
      confidence: 'medium',
    });
  }

  return createCheck({
    description,
    earned: max,
    id,
    label,
    max,
    scope: getScope(signal.scope, 'project'),
    severity,
    source: signal.path ?? label,
    status: 'passed',
    confidence: 'high',
  });
};

export const createScriptCheck = ({
  id,
  label,
  max,
  missingDescription,
  partialEarned,
  script,
  severity,
}: {
  id: ReportScoreCheckId;
  label: string;
  max: number;
  missingDescription: string;
  partialEarned: number;
  script: ScriptSignal;
  severity: ScoringCheck['severity'];
}): ScoringCheck => {
  if (!script.exists) {
    return createCheck({
      description: missingDescription,
      earned: 0,
      id,
      label,
      max,
      scope: 'project',
      severity,
      source: script.source ?? `package.json scripts.${script.name}`,
      status: 'failed',
      confidence: 'high',
    });
  }

  if (script.scope === 'root') {
    return createCheck({
      description: 'Only a root-level monorepo script was found.',
      earned: partialEarned,
      id,
      label,
      max,
      scope: 'root',
      severity,
      source: script.source ?? `package.json scripts.${script.name}`,
      status: 'partial',
      confidence: 'medium',
    });
  }

  return createCheck({
    earned: max,
    id,
    label,
    max,
    scope: 'project',
    severity,
    source: script.source ?? `package.json scripts.${script.name}`,
    status: 'passed',
    confidence: 'high',
  });
};

export const createToolCheck = ({
  id,
  label,
  max,
  missingDescription,
  partialDescription,
  partialEarned,
  signal,
  severity,
}: {
  id: ReportScoreCheckId;
  label: string;
  max: number;
  missingDescription: string;
  partialDescription?: string;
  partialEarned: number;
  signal: ToolSignal;
  severity: ScoringCheck['severity'];
}): ScoringCheck => {
  const projectSources = signal.projectSources ?? [];
  const rootSources = signal.rootSources ?? [];

  if (!signal.found) {
    return createCheck({
      description: missingDescription,
      earned: 0,
      id,
      label,
      max,
      scope: 'project',
      severity,
      source: 'package.json',
      status: 'failed',
      confidence: 'high',
    });
  }

  if (projectSources.length === 0 && rootSources.length > 0) {
    return createCheck({
      description: partialDescription ?? 'Only root-level tooling was found for this project.',
      earned: partialEarned,
      id,
      label,
      max,
      scope: 'root',
      severity,
      source: rootSources.map((source) => source.raw).join(', '),
      status: 'partial',
      confidence: 'medium',
    });
  }

  return createCheck({
    earned: max,
    id,
    label,
    max,
    scope: 'project',
    severity,
    source: signal.sources.map((source) => source.raw).join(', ') || 'package.json',
    status: 'passed',
    confidence: 'high',
  });
};

export const createCiCheck = ({
  id,
  label,
  max,
  missingDescription,
  signal,
  severity,
}: {
  id: ReportScoreCheckId;
  label: string;
  max: number;
  missingDescription: string;
  signal: RepositorySignals['ciAnalysis']['build'];
  severity: ScoringCheck['severity'];
}): ScoringCheck =>
  createCheck({
    description: signal.found ? undefined : missingDescription,
    earned: signal.found ? max : 0,
    id,
    label,
    max,
    scope: 'github',
    severity,
    source: signal.sources.join(', ') || '.github/workflows',
    status: signal.found ? 'passed' : 'failed',
    confidence: signal.found ? 'high' : 'medium',
  });

export const createMetric = ({
  category,
  checks,
  description,
  label,
}: {
  category: ScoreCategory;
  checks: ScoringCheck[];
  description: string;
  label: string;
}): ScoreBreakdownItem => {
  const scoreDetails = calculateCategoryScore({
    checks,
    weight: scoreCategoryWeights[category],
  });

  return {
    category,
    label,
    value: scoreDetails.finalValue,
    maxValue: 100,
    status: getScoreStatusByValue(scoreDetails.finalValue),
    description,
    scoreDetails,
  };
};
