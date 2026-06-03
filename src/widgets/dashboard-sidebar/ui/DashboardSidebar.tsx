import clsx from 'clsx';
import {
  Activity,
  BarChart3,
  GitBranch,
  History,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import s from './DashboardSidebar.module.scss';
import {
  dashboardNavigationItems,
  dashboardSectionNavigationItems,
  type DashboardNavigationIcon,
} from '../model/navigation';

import type { MouseEvent } from 'react';

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onNavigate?: () => void;
  onSectionNavigate?: (href: string) => void;
}

const navigationIcons: Record<DashboardNavigationIcon, LucideIcon> = {
  overview: LayoutDashboard,
  history: History,
  settings: Settings,
  repository: GitBranch,
  healthScore: Activity,
  metrics: BarChart3,
  checks: ListChecks,
  recommendations: Lightbulb,
};

export const DashboardSidebar = ({
  isCollapsed = false,
  isMobileOpen = false,
  onNavigate,
  onSectionNavigate,
}: DashboardSidebarProps) => {
  const handleSectionLinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!onSectionNavigate) {
      onNavigate?.();
      return;
    }

    event.preventDefault();
    onSectionNavigate(href);
  };

  return (
    <aside
      className={clsx(
        s.dashboardSidebar,
        isCollapsed && s.dashboardSidebarCollapsed,
        isMobileOpen && s.dashboardSidebarMobileOpen,
      )}
    >
      <div className={s.sidebarBody}>
        <nav aria-label="Dashboard navigation" className={s.navigation}>
          {dashboardNavigationItems.map((item) => {
            const Icon = navigationIcons[item.icon];

            return (
              <NavLink
                aria-label={item.label}
                className={({ isActive }) =>
                  clsx(s.navigationLink, isActive && s.navigationLinkActive)
                }
                end={item.end}
                key={item.to}
                onClick={onNavigate}
                title={isCollapsed ? item.label : undefined}
                to={item.to}
              >
                <Icon aria-hidden="true" className={s.navigationIcon} strokeWidth={2} />
                <span className={s.navigationText}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <nav aria-label="Page navigation" className={s.sectionNavigation}>
          <p className={s.sectionNavigationTitle}>On this page</p>

          <div className={s.sectionNavigationLinks}>
            {dashboardSectionNavigationItems.map((item) => {
              const Icon = navigationIcons[item.icon];

              return (
                <a
                  aria-label={item.label}
                  className={s.sectionNavigationLink}
                  href={item.href}
                  key={item.href}
                  onClick={(event) => handleSectionLinkClick(event, item.href)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon aria-hidden="true" className={s.sectionNavigationIcon} strokeWidth={2} />
                  <span className={s.sectionNavigationText}>{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
};
