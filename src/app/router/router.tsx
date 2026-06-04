import { createBrowserRouter } from 'react-router-dom';

import { DashboardLayout } from '@/app/layouts/dashboard-layout';
import { PublicLayout } from '@/app/layouts/public-layout';
import { DashboardPage } from '@/pages/dashboard';
import { RouteErrorPage } from '@/pages/error';
import { HomePage } from '@/pages/home';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: AppRoutes.HOME,
        element: <HomePage />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: AppRoutes.DASHBOARD,
        element: <DashboardPage />,
      },
    ],
  },
]);
