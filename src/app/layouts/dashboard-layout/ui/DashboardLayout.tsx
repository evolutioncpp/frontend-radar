import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { selectIsDashboardSidebarCollapsed, toggleDashboardSidebar } from '@/features/app-settings';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';
import { useBodyScrollLock } from '@/shared/lib/use-body-scroll-lock';
import { DashboardHeader } from '@/widgets/dashboard-header';
import { DashboardSidebar } from '@/widgets/dashboard-sidebar';

import s from './DashboardLayout.module.scss';

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(selectIsDashboardSidebarCollapsed);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useBodyScrollLock(isMobileSidebarOpen);

  const toggleSidebar = () => {
    dispatch(toggleDashboardSidebar());
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((currentValue) => !currentValue);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const navigateToSection = (href: string) => {
    setIsMobileSidebarOpen(false);

    const sectionId = href.startsWith('#') ? href.slice(1) : href;

    window.history.pushState(null, '', href);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });
  };

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className={clsx(s.dashboardLayout, isSidebarCollapsed && s.dashboardLayoutCollapsed)}>
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onNavigate={closeMobileSidebar}
        onSectionNavigate={navigateToSection}
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
