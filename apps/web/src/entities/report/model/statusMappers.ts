import type { CheckStatus, RecommendationSeverity, ScoreStatus } from './types';
import type { BadgeVariant } from '@/shared/ui/Badge';

export const getScoreStatusBadgeVariant = (status: ScoreStatus): BadgeVariant => {
  switch (status) {
    case 'excellent':
      return 'success';
    case 'good':
      return 'info';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'danger';
  }
};

export const getCheckStatusBadgeVariant = (status: CheckStatus): BadgeVariant => {
  switch (status) {
    case 'passed':
      return 'success';
    case 'warning':
      return 'warning';
    case 'failed':
      return 'danger';
  }
};

export const getRecommendationSeverityBadgeVariant = (
  severity: RecommendationSeverity,
): BadgeVariant => {
  switch (severity) {
    case 'low':
      return 'info';
    case 'medium':
      return 'warning';
    case 'high':
      return 'danger';
  }
};
