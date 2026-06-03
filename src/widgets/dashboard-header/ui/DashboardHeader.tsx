import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const SidebarToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;
  const MobileToggleIcon = isMobileSidebarOpen ? X : Menu;

  return (
    <header className={s.dashboardHeader}>
      <button
        aria-expanded={!isSidebarCollapsed}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={s.sidebarToggle}
        onClick={onToggleSidebar}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
      >
        <SidebarToggleIcon aria-hidden="true" className={s.toggleIcon} strokeWidth={2} />
      </button>

      <div className={s.start}>
        <button
          aria-expanded={isMobileSidebarOpen}
          aria-label={isMobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
          className={s.mobileSidebarToggle}
          onClick={onToggleMobileSidebar}
          title={isMobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
          type="button"
        >
          <MobileToggleIcon aria-hidden="true" className={s.toggleIcon} strokeWidth={2} />
        </button>

        <Link className={s.logo} to={AppRoutes.HOME}>
          {projectConfig.name}
        </Link>
      </div>

      <div className={s.actions}>
        <a
          aria-label="Open Frontend Radar repository on GitHub"
          className={s.link}
          href={projectConfig.repositoryUrl}
          rel="noreferrer"
          target="_blank"
        >
          View on GitHub
        </a>
      </div>
    </header>
  );
};
