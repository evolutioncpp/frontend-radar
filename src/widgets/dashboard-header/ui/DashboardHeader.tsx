import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/features/app-settings';
import { projectConfig } from '@/shared/config/project';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

import s from './DashboardHeader.module.scss';

interface DashboardHeaderProps {
  isSidebarCollapsed?: boolean;
  isMobileSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const DashboardHeader = ({
  isMobileSidebarOpen = false,
  isSidebarCollapsed = false,
  onToggleMobileSidebar,
  onToggleSidebar,
}: DashboardHeaderProps) => {
  const { t } = useTranslation('dashboard');

  const SidebarToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;
  const MobileToggleIcon = isMobileSidebarOpen ? X : Menu;

  const sidebarToggleLabel = isSidebarCollapsed
    ? t('header.expandSidebar')
    : t('header.collapseSidebar');

  const mobileSidebarToggleLabel = isMobileSidebarOpen
    ? t('header.closeNavigation')
    : t('header.openNavigation');

  return (
    <header className={s.dashboardHeader}>
      <button
        aria-expanded={!isSidebarCollapsed}
        aria-label={sidebarToggleLabel}
        className={s.sidebarToggle}
        onClick={onToggleSidebar}
        title={sidebarToggleLabel}
        type="button"
      >
        <SidebarToggleIcon aria-hidden="true" className={s.toggleIcon} strokeWidth={2} />
      </button>

      <div className={s.start}>
        <button
          aria-expanded={isMobileSidebarOpen}
          aria-label={mobileSidebarToggleLabel}
          className={s.mobileSidebarToggle}
          onClick={onToggleMobileSidebar}
          title={mobileSidebarToggleLabel}
          type="button"
        >
          <MobileToggleIcon aria-hidden="true" className={s.toggleIcon} strokeWidth={2} />
        </button>

        <Link className={s.logo} to={AppRoutes.HOME}>
          {projectConfig.name}
        </Link>
      </div>

      <div className={s.actions}>
        <ThemeToggle />

        <a
          aria-label={t('header.openRepositoryAria')}
          className={s.link}
          href={projectConfig.repositoryUrl}
          rel="noreferrer"
          target="_blank"
        >
          {t('header.openRepository')}
        </a>
      </div>
    </header>
  );
};
