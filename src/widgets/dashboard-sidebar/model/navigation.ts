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
  label: string;
  to: string;
  icon: DashboardNavigationIcon;
  end?: boolean;
}

interface DashboardSectionNavigationItem {
  label: string;
  href: string;
  icon: DashboardNavigationIcon;
}

export const dashboardNavigationItems: DashboardNavigationItem[] = [
  {
    label: 'Overview',
    to: AppRoutes.DASHBOARD,
    icon: 'overview',
    end: true,
  },
  {
    label: 'History',
    to: AppRoutes.DASHBOARD_HISTORY,
    icon: 'history',
  },
  {
    label: 'Settings',
    to: AppRoutes.DASHBOARD_SETTINGS,
    icon: 'settings',
  },
];

export const dashboardSectionNavigationItems: DashboardSectionNavigationItem[] = [
  {
    label: 'Repository',
    href: `#${DashboardSectionIds.REPOSITORY}`,
    icon: 'repository',
  },
  {
    label: 'Health score',
    href: `#${DashboardSectionIds.HEALTH_SCORE}`,
    icon: 'healthScore',
  },
  {
    label: 'Metrics',
    href: `#${DashboardSectionIds.METRICS}`,
    icon: 'metrics',
  },
  {
    label: 'Checks',
    href: `#${DashboardSectionIds.CHECKS}`,
    icon: 'checks',
  },
  {
    label: 'Recommendations',
    href: `#${DashboardSectionIds.RECOMMENDATIONS}`,
    icon: 'recommendations',
  },
];
