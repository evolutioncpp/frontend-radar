import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { selectIsDashboardSidebarCollapsed, toggleDashboardSidebar } from '@/features/app-settings';
import {
  getDashboardSectionIdFromHash,
  useDashboardSectionHashSync,
} from '@/features/dashboard-section-navigation';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';
import { DashboardHeader } from '@/widgets/dashboard-header';
import { DashboardSidebar, dashboardSectionNavigationItems } from '@/widgets/dashboard-sidebar';

import s from './DashboardLayout.module.scss';
import { useDashboardMobileSidebar } from '../model/useDashboardMobileSidebar';

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const isSidebarCollapsed = useAppSelector(selectIsDashboardSidebarCollapsed);

  const [dashboardSectionsReadyState, setDashboardSectionsReadyState] = useState({
    availableHrefs: [] as string[],
    pathname: '',
    readyVersion: 0,
  });
  const dashboardSectionsReadyVersion =
    dashboardSectionsReadyState.pathname === pathname
      ? dashboardSectionsReadyState.readyVersion
      : 0;
  const isDashboardSectionNavigationReady = dashboardSectionsReadyVersion > 0;
  const availableSectionNavigationItems = useMemo(() => {
    if (!isDashboardSectionNavigationReady) {
      return undefined;
    }

    const availableHrefs = new Set(dashboardSectionsReadyState.availableHrefs);

    return dashboardSectionNavigationItems.filter((item) => availableHrefs.has(item.href));
  }, [dashboardSectionsReadyState.availableHrefs, isDashboardSectionNavigationReady]);

  const { activeSectionHref, navigateToSection } = useDashboardSectionHashSync({
    readyVersion: dashboardSectionsReadyVersion,
  });

  const { closeMobileSidebar, isMobileSidebarOpen, toggleMobileSidebar } =
    useDashboardMobileSidebar();

  const toggleSidebar = () => {
    dispatch(toggleDashboardSidebar());
  };

  const handleDashboardSectionsReady = useCallback(() => {
    const availableHrefs = dashboardSectionNavigationItems
      .filter((item) => document.getElementById(getDashboardSectionIdFromHash(item.href)))
      .map((item) => item.href);

    setDashboardSectionsReadyState((currentState) => ({
      availableHrefs,
      pathname,
      readyVersion: currentState.pathname === pathname ? currentState.readyVersion + 1 : 1,
    }));
  }, [pathname]);

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
        sectionNavigationItems={availableSectionNavigationItems}
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
