import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from '@/pages/home';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

/* Pages */

export const router = createBrowserRouter([
  {
    path: AppRoutes.HOME,
    element: <HomePage />,
  },
]);
