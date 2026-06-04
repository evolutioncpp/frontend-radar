import { DashboardSectionIds } from '@/shared/config/navigation/dashboardSections';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

export type DashboardNavigationIcon =
  | 'overview'
  | 'history'
  | 'settings'
  | 'repository'
  | 'healthScore'
  | 'metrics'
  | 'checks'
  | 'recommendations';

interface DashboardNavigationItem {
  to: string;
  icon: DashboardNavigationIcon;
  end?: boolean;
}

interface DashboardSectionNavigationItem {
  href: string;
  icon: DashboardNavigationIcon;
}

export const dashboardNavigationItems: DashboardNavigationItem[] = [
  {
    to: AppRoutes.DASHBOARD,
    icon: 'overview',
    end: true,
  },
  {
    to: AppRoutes.DASHBOARD_HISTORY,
    icon: 'history',
  },
  {
    to: AppRoutes.DASHBOARD_SETTINGS,
    icon: 'settings',
  },
];

export const dashboardSectionNavigationItems: DashboardSectionNavigationItem[] = [
  {
    href: `#${DashboardSectionIds.REPOSITORY}`,
    icon: 'repository',
  },
  {
    href: `#${DashboardSectionIds.HEALTH_SCORE}`,
    icon: 'healthScore',
  },
  {
    href: `#${DashboardSectionIds.METRICS}`,
    icon: 'metrics',
  },
  {
    href: `#${DashboardSectionIds.CHECKS}`,
    icon: 'checks',
  },
  {
    href: `#${DashboardSectionIds.RECOMMENDATIONS}`,
    icon: 'recommendations',
  },
];
