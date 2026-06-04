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

import { LanguageSwitcher } from '@/features/app-settings';
import { Tooltip } from '@/shared/ui/Tooltip';

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
  const isTooltipDisabled = !isCollapsed || isMobileOpen;

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
              <Tooltip
                align="center"
                className={isCollapsed ? s.collapsedTooltip : undefined}
                content={item.label}
                disabled={isTooltipDisabled}
                isFullWidth
                key={item.to}
                side="right"
              >
                <NavLink
                  aria-label={item.label}
                  className={({ isActive }) =>
                    clsx(s.navigationLink, isActive && s.navigationLinkActive)
                  }
                  end={item.end}
                  onClick={onNavigate}
                  to={item.to}
                >
                  <Icon aria-hidden="true" className={s.navigationIcon} strokeWidth={2} />
                  <span className={s.navigationText}>{item.label}</span>
                </NavLink>
              </Tooltip>
            );
          })}
        </nav>

        <nav aria-label="Page navigation" className={s.sectionNavigation}>
          <p className={s.sectionNavigationTitle}>On this page</p>

          <div className={s.sectionNavigationLinks}>
            {dashboardSectionNavigationItems.map((item) => {
              const Icon = navigationIcons[item.icon];

              return (
                <Tooltip
                  align="center"
                  className={isCollapsed ? s.collapsedTooltip : undefined}
                  content={item.label}
                  disabled={isTooltipDisabled}
                  isFullWidth
                  key={item.href}
                  side="right"
                >
                  <a
                    aria-label={item.label}
                    className={s.sectionNavigationLink}
                    href={item.href}
                    onClick={(event) => handleSectionLinkClick(event, item.href)}
                  >
                    <Icon aria-hidden="true" className={s.sectionNavigationIcon} strokeWidth={2} />
                    <span className={s.sectionNavigationText}>{item.label}</span>
                  </a>
                </Tooltip>
              );
            })}
          </div>
        </nav>

        <div className={s.sidebarFooter}>
          <LanguageSwitcher
            align="center"
            isCollapsed={isCollapsed}
            side="right"
            variant="sidebar"
          />
        </div>
      </div>
    </aside>
  );
};
