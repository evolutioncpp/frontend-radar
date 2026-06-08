import { dashboardSectionSidebarLabelKeys } from '@/shared/config/navigation/dashboardSections';

import type { DashboardNavigationIcon, DashboardPageNavigationIcon } from './navigation';

const dashboardPageNavigationLabelKeys = {
  overview: 'sidebar.items.overview',
  history: 'sidebar.items.history',
  settings: 'sidebar.items.settings',
} as const satisfies Record<DashboardPageNavigationIcon, string>;

export const navigationLabelKeys = {
  ...dashboardPageNavigationLabelKeys,
  ...dashboardSectionSidebarLabelKeys,
} as const satisfies Record<DashboardNavigationIcon, string>;
