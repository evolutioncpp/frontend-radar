import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/features/app-settings';

import { DashboardNavigationLink } from './DashboardNavigationLink';
import { DashboardSectionNavigationLink } from './DashboardSectionNavigationLink';
import s from './DashboardSidebar.module.scss';
import { dashboardNavigationItems } from '../model/navigation';

import type { DashboardSectionNavigationItem } from '../model/navigation';

interface DashboardSidebarProps {
  activeSectionHref?: string;
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onNavigate?: () => void;
  onSectionNavigate?: (href: string) => void;
  sectionNavigationItems?: DashboardSectionNavigationItem[];
}

export const DashboardSidebar = ({
  activeSectionHref = '',
  isCollapsed = false,
  isMobileOpen = false,
  onNavigate,
  onSectionNavigate,
  sectionNavigationItems = [],
}: DashboardSidebarProps) => {
  const { t } = useTranslation('dashboard');

  const isTooltipDisabled = !isCollapsed || isMobileOpen;
  const isSectionNavigationVisible = sectionNavigationItems.length > 0;

  return (
    <aside
      className={clsx(
        s.dashboardSidebar,
        isCollapsed && s.dashboardSidebarCollapsed,
        isMobileOpen && s.dashboardSidebarMobileOpen,
      )}
    >
      <div className={s.sidebarBody}>
        <nav aria-label={t('sidebar.dashboardNavigation')} className={s.navigation}>
          {dashboardNavigationItems.map((item) => (
            <DashboardNavigationLink
              end={item.end}
              icon={item.icon}
              isCollapsed={isCollapsed}
              isTooltipDisabled={isTooltipDisabled}
              key={item.to}
              onNavigate={onNavigate}
              to={item.to}
            />
          ))}
        </nav>

        {isSectionNavigationVisible ? (
          <nav aria-label={t('sidebar.pageNavigation')} className={s.sectionNavigation}>
            <p className={s.sectionNavigationTitle}>{t('sidebar.onThisPage')}</p>

            <div className={s.sectionNavigationLinks}>
              {sectionNavigationItems.map((item) => (
                <DashboardSectionNavigationLink
                  href={item.href}
                  icon={item.icon}
                  isActive={activeSectionHref === item.href}
                  isCollapsed={isCollapsed}
                  isTooltipDisabled={isTooltipDisabled}
                  key={item.href}
                  onNavigate={onNavigate}
                  onSectionNavigate={onSectionNavigate}
                />
              ))}
            </div>
          </nav>
        ) : null}

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
