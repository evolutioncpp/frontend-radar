import type { DashboardNavigationIcon } from './navigation';

export const navigationLabelKeys = {
  overview: 'sidebar.items.overview',
  history: 'sidebar.items.history',
  settings: 'sidebar.items.settings',
  repository: 'sidebar.items.repository',
  healthScore: 'sidebar.items.healthScore',
  metrics: 'sidebar.items.metrics',
  checks: 'sidebar.items.checks',
  recommendations: 'sidebar.items.recommendations',
} as const satisfies Record<DashboardNavigationIcon, string>;
