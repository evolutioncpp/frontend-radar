import { AppRoutes } from '@/shared/config/routes/appRoutes';

export const dashboardNavigationItems = [
  {
    label: 'Overview',
    to: AppRoutes.DASHBOARD,
    end: true,
  },
  {
    label: 'History',
    to: AppRoutes.DASHBOARD_HISTORY,
    end: false,
  },
  {
    label: 'Settings',
    to: AppRoutes.DASHBOARD_SETTINGS,
    end: false,
  },
] as const;
