import clsx from 'clsx';
import { Outlet } from 'react-router-dom';

import { selectIsDashboardSidebarCollapsed, toggleDashboardSidebar } from '@/features/app-settings';
import { navigateToDashboardSection } from '@/features/dashboard-section-navigation';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';
import { DashboardHeader } from '@/widgets/dashboard-header';
import { DashboardSidebar } from '@/widgets/dashboard-sidebar';

import s from './DashboardLayout.module.scss';
import { useDashboardMobileSidebar } from '../model/useDashboardMobileSidebar';

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(selectIsDashboardSidebarCollapsed);

  const { closeMobileSidebar, isMobileSidebarOpen, toggleMobileSidebar } =
    useDashboardMobileSidebar();

  const toggleSidebar = () => {
    dispatch(toggleDashboardSidebar());
  };

  const handleSectionNavigate = (href: string) => {
    closeMobileSidebar();
    navigateToDashboardSection(href);
  };

  return (
    <div className={clsx(s.dashboardLayout, isSidebarCollapsed && s.dashboardLayoutCollapsed)}>
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onNavigate={closeMobileSidebar}
        onSectionNavigate={handleSectionNavigate}
      />

      <div
        aria-hidden="true"
        className={clsx(
          s.mobileSidebarOverlay,
          isMobileSidebarOpen && s.mobileSidebarOverlayVisible,
        )}
        onClick={closeMobileSidebar}
      />

      <div className={s.workspace}>
        <DashboardHeader
          isMobileSidebarOpen={isMobileSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleMobileSidebar={toggleMobileSidebar}
          onToggleSidebar={toggleSidebar}
        />

        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
