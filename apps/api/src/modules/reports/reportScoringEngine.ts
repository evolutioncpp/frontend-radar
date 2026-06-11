import { scoreCaps, scoreImpactWeightThresholds } from './reportAnalysisConfig.js';

import type { ProjectReport } from './reportSchemas.js';

export type ScoringCheck =
  ProjectReport['scoreBreakdown'][number]['scoreDetails']['checks'][number];
export type ScoreDetails = ProjectReport['scoreBreakdown'][number]['scoreDetails'];
type ScoreCap = NonNullable<ScoreDetails['cap']>;

export const scoreCapReasons = {
  criticalMissingCheck: 'A critical scoring check is missing.',
  warningKeyCheck: 'A key scoring check is only partially satisfied.',
} as const;

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export const getScoreImpactLevel = (weight: number): ScoreDetails['impactLevel'] => {
  if (weight >= scoreImpactWeightThresholds.key) {
    return 'key';
  }

  if (weight >= scoreImpactWeightThresholds.important) {
    return 'important';
  }

  return 'supporting';
};

const getCapCandidates = (checks: readonly ScoringCheck[]): ScoreCap[] => {
  const caps: ScoreCap[] = [];

  for (const check of checks) {
    if (check.status === 'failed' && check.severity === 'critical') {
      caps.push({
        value: scoreCaps.criticalMissingCheck,
        reason: scoreCapReasons.criticalMissingCheck,
        source: check.source ?? check.label,
      });
      continue;
    }

    if ((check.status === 'partial' || check.status === 'unknown') && check.severity !== 'minor') {
      caps.push({
        value: scoreCaps.warningKeyCheck,
        reason: scoreCapReasons.warningKeyCheck,
        source: check.source ?? check.label,
      });
    }
  }

  return caps;
};

export const calculateCategoryScore = ({
  checks,
  weight,
}: {
  checks: readonly ScoringCheck[];
  weight: number;
}): ScoreDetails => {
  const max = checks.reduce((sum, check) => sum + check.max, 0);
  const earned = checks.reduce((sum, check) => sum + check.earned, 0);
  const rawValue = max > 0 ? clampScore((earned / max) * 100) : 0;
  const cap = getCapCandidates(checks).sort((left, right) => left.value - right.value)[0];
  const finalValue = clampScore(cap ? Math.min(rawValue, cap.value) : rawValue);

  return {
    rawValue,
    finalValue,
    weight,
    impactLevel: getScoreImpactLevel(weight),
    ...(cap ? { cap } : {}),
    checks: [...checks],
  };
};

export const calculateWeightedTotalScore = (
  scoreBreakdown: readonly ProjectReport['scoreBreakdown'][number][],
) => {
  const totalWeight = scoreBreakdown.reduce((sum, metric) => sum + metric.scoreDetails.weight, 0);

  if (totalWeight <= 0) {
    return 0;
  }

  return clampScore(
    scoreBreakdown.reduce((sum, metric) => sum + metric.value * metric.scoreDetails.weight, 0) /
      totalWeight,
  );
};
