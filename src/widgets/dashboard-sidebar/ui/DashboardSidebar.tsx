import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/features/app-settings';

import { DashboardNavigationLink } from './DashboardNavigationLink';
import { DashboardSectionNavigationLink } from './DashboardSectionNavigationLink';
import s from './DashboardSidebar.module.scss';
import { dashboardNavigationItems, dashboardSectionNavigationItems } from '../model/navigation';

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onNavigate?: () => void;
  onSectionNavigate?: (href: string) => void;
}

export const DashboardSidebar = ({
  isCollapsed = false,
  isMobileOpen = false,
  onNavigate,
  onSectionNavigate,
}: DashboardSidebarProps) => {
  const { t } = useTranslation('dashboard');

  const isTooltipDisabled = !isCollapsed || isMobileOpen;

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

        <nav aria-label={t('sidebar.pageNavigation')} className={s.sectionNavigation}>
          <p className={s.sectionNavigationTitle}>{t('sidebar.onThisPage')}</p>

          <div className={s.sectionNavigationLinks}>
            {dashboardSectionNavigationItems.map((item) => (
              <DashboardSectionNavigationLink
                href={item.href}
                icon={item.icon}
                isCollapsed={isCollapsed}
                isTooltipDisabled={isTooltipDisabled}
                key={item.href}
                onNavigate={onNavigate}
                onSectionNavigate={onSectionNavigate}
              />
            ))}
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
