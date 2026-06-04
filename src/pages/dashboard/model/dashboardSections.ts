import { DashboardSectionIds } from '@/shared/config/navigation/dashboardSections';

import type { DashboardSectionId } from '@/features/dashboard-section-navigation';

export const dashboardSectionLabelKeys = {
  [DashboardSectionIds.REPOSITORY]: 'page.sections.repository',
  [DashboardSectionIds.HEALTH_SCORE]: 'page.sections.healthScore',
  [DashboardSectionIds.METRICS]: 'page.sections.metrics',
  [DashboardSectionIds.CHECKS]: 'page.sections.checks',
  [DashboardSectionIds.RECOMMENDATIONS]: 'page.sections.recommendations',
} as const satisfies Record<DashboardSectionId, string>;

export type { DashboardSectionId };
