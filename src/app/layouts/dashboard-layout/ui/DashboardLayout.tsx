import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { selectIsDashboardSidebarCollapsed, toggleDashboardSidebar } from '@/features/app-settings';
import { useDashboardSectionHashSync } from '@/features/dashboard-section-navigation';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';
import { DashboardHeader } from '@/widgets/dashboard-header';
import { DashboardSidebar } from '@/widgets/dashboard-sidebar';

import s from './DashboardLayout.module.scss';
import { useDashboardMobileSidebar } from '../model/useDashboardMobileSidebar';

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(selectIsDashboardSidebarCollapsed);

  const [dashboardSectionsReadyVersion, setDashboardSectionsReadyVersion] = useState(0);

  const { activeSectionHref, navigateToSection } = useDashboardSectionHashSync({
    readyVersion: dashboardSectionsReadyVersion,
  });

  const { closeMobileSidebar, isMobileSidebarOpen, toggleMobileSidebar } =
    useDashboardMobileSidebar();

  const toggleSidebar = () => {
    dispatch(toggleDashboardSidebar());
  };

  const handleDashboardSectionsReady = useCallback(() => {
    setDashboardSectionsReadyVersion((currentVersion) => currentVersion + 1);
  }, []);

  const outletContext = useMemo(
    () => ({
      onDashboardSectionsReady: handleDashboardSectionsReady,
    }),
    [handleDashboardSectionsReady],
  );

  const handleSectionNavigate = (href: string) => {
    closeMobileSidebar();
    navigateToSection(href);
  };

  return (
    <div className={clsx(s.dashboardLayout, isSidebarCollapsed && s.dashboardLayoutCollapsed)}>
      <DashboardSidebar
        activeSectionHref={activeSectionHref}
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
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
};
