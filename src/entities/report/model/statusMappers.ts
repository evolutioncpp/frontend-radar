import type { CheckStatus, RecommendationSeverity, ScoreStatus } from './types';
import type { BadgeVariant } from '@/shared/ui/Badge';

export const getScoreStatusLabel = (status: ScoreStatus) => {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'warning':
      return 'Needs attention';
    case 'critical':
      return 'Critical';
  }
};

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

export const getCheckStatusLabel = (status: CheckStatus) => {
  switch (status) {
    case 'passed':
      return 'Passed';
    case 'warning':
      return 'Warning';
    case 'failed':
      return 'Failed';
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

export const getRecommendationSeverityLabel = (severity: RecommendationSeverity) => {
  switch (severity) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
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
