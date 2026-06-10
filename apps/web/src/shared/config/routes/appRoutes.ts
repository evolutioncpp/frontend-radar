export const AppRoutes = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  DASHBOARD_HISTORY: '/dashboard/history',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  REPORT: '/dashboard/report/:id',
  COMPARE: '/compare',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

interface GetReportPathOptions {
  compareWith?: string | null;
}

export const getReportPath = (reportId: string, options: GetReportPathOptions = {}) => {
  const path = AppRoutes.REPORT.replace(':id', reportId);

  if (!options.compareWith) {
    return path;
  }

  return `${path}?${new URLSearchParams({ compareWith: options.compareWith }).toString()}`;
};
