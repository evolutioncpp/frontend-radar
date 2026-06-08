import { AppRoutes } from '@/shared/config/routes/appRoutes';

export const publicNavigationItems = [
  {
    label: 'Home',
    to: AppRoutes.HOME,
  },
  {
    label: 'Demo dashboard',
    to: AppRoutes.DASHBOARD,
  },
] as const;
