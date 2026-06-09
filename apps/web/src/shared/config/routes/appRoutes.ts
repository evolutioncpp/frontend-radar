export const AppRoutes = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  DASHBOARD_HISTORY: '/dashboard/history',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  REPORT: '/dashboard/report/:id',
  COMPARE: '/compare',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

export const DEMO_REPORT_ID = 'demo';

export const getDemoReportPath = () => {
  return AppRoutes.REPORT.replace(':id', DEMO_REPORT_ID);
};

export const getReportPath = (reportId: string) => {
  return AppRoutes.REPORT.replace(':id', reportId);
};
