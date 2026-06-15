import { createBrowserRouter } from 'react-router-dom';

import { DashboardLayout } from '@/app/layouts/dashboard-layout';
import { DashboardPage } from '@/pages/dashboard';
import { DashboardHistoryPage } from '@/pages/dashboard-history';
import { DashboardSettingsPage } from '@/pages/dashboard-settings';
import { RouteErrorPage } from '@/pages/error';
import { ReportPage } from '@/pages/report';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

export const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: AppRoutes.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: AppRoutes.HISTORY,
        element: <DashboardHistoryPage />,
      },
      {
        path: AppRoutes.SETTINGS,
        element: <DashboardSettingsPage />,
      },
      {
        path: AppRoutes.REPORT,
        element: <ReportPage />,
      },
    ],
  },
]);
