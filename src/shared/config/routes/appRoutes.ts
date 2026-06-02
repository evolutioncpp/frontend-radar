export const AppRoutes = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  DASHBOARD_HISTORY: '/dashboard/history',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  REPORT: '/report/:id',
  COMPARE: '/compare',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];
