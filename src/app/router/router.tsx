import { createBrowserRouter } from 'react-router-dom';

import { DashboardLayout } from '@/app/layouts/dashboard-layout';
import { PublicLayout } from '@/app/layouts/public-layout';
import { DashboardPage } from '@/pages/dashboard';
import { HomePage } from '@/pages/home';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: AppRoutes.HOME,
        element: <HomePage />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: AppRoutes.DASHBOARD,
        element: <DashboardPage />,
      },
    ],
  },
]);
