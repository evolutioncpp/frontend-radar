import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/features/app-settings';
import GithubIcon from '@/shared/assets/icons/GitHub_Invertocat_Black.svg?react';
import { projectConfig } from '@/shared/config/project';
import { AppRoutes } from '@/shared/config/routes/appRoutes';
import { Button } from '@/shared/ui/Button';

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
      <Button
        aria-expanded={!isSidebarCollapsed}
        aria-label={sidebarToggleLabel}
        className={s.sidebarToggle}
        onClick={onToggleSidebar}
        title={sidebarToggleLabel}
        variant="secondary"
      >
        <SidebarToggleIcon aria-hidden="true" className={s.toggleIcon} strokeWidth={2} />
      </Button>

      <div className={s.start}>
        <Button
          aria-expanded={isMobileSidebarOpen}
          aria-label={mobileSidebarToggleLabel}
          className={s.mobileSidebarToggle}
          onClick={onToggleMobileSidebar}
          title={mobileSidebarToggleLabel}
          variant="secondary"
        >
          <MobileToggleIcon aria-hidden="true" className={s.toggleIcon} strokeWidth={2} />
        </Button>

        <Link className={s.logo} to={AppRoutes.DASHBOARD}>
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
          <GithubIcon aria-hidden="true" className={s.icon} focusable="false" />
          {t('header.openRepository')}
        </a>
      </div>
    </header>
  );
};
