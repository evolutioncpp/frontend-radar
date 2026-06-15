export const AppRoutes = {
  DASHBOARD: '/',
  HISTORY: '/history',
  SETTINGS: '/settings',
  REPORT: '/report/:id',
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
