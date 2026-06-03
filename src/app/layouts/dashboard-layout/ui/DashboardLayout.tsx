import { Outlet } from 'react-router-dom';

import { DashboardHeader } from '@/widgets/dashboard-header';
import { DashboardSidebar } from '@/widgets/dashboard-sidebar';

import s from './DashboardLayout.module.scss';

export const DashboardLayout = () => {
  return (
    <div className={s.dashboardLayout}>
      <DashboardSidebar />

      <div className={s.workspace}>
        <DashboardHeader />

        <main className={s.content} id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
