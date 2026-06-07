import {
  dashboardSections,
  type DashboardSectionNavigationIcon,
} from '@/shared/config/navigation/dashboardSections';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

export type DashboardPageNavigationIcon = 'overview' | 'history' | 'settings';
export type DashboardNavigationIcon = DashboardPageNavigationIcon | DashboardSectionNavigationIcon;

interface DashboardNavigationItem {
  to: string;
  icon: DashboardPageNavigationIcon;
  end?: boolean;
}

export interface DashboardSectionNavigationItem {
  href: string;
  icon: DashboardSectionNavigationIcon;
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

export const dashboardSectionNavigationItems: DashboardSectionNavigationItem[] =
  dashboardSections.map((section) => ({
    href: section.href,
    icon: section.navigationIcon,
  }));
