import type { ScoreStatus } from './types';

export const getScoreStatus = (score: number): ScoreStatus => {
  if (score >= 90) {
    return 'excellent';
  }

  if (score >= 75) {
    return 'good';
  }

  if (score >= 50) {
    return 'warning';
  }

  return 'critical';
};
