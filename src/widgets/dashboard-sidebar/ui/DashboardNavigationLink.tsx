import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { Tooltip } from '@/shared/ui/Tooltip';

import s from './DashboardSidebar.module.scss';
import { navigationIcons } from '../model/navigationIcons';
import { navigationLabelKeys } from '../model/navigationLabelKeys';

import type { DashboardNavigationIcon } from '../model/navigation';

interface DashboardNavigationLinkProps {
  to: string;
  icon: DashboardNavigationIcon;
  isCollapsed: boolean;
  isTooltipDisabled: boolean;
  end?: boolean;
  onNavigate?: () => void;
}

export const DashboardNavigationLink = ({
  end,
  icon,
  isCollapsed,
  isTooltipDisabled,
  onNavigate,
  to,
}: DashboardNavigationLinkProps) => {
  const { t } = useTranslation('dashboard');

  const Icon = navigationIcons[icon];
  const label = t(navigationLabelKeys[icon]);

  return (
    <Tooltip
      align="center"
      className={clsx(s.sidebarTooltip, isCollapsed && s.sidebarTooltipCollapsed)}
      content={label}
      disabled={isTooltipDisabled}
      isFullWidth
      side="right"
    >
      <NavLink
        aria-label={label}
        className={({ isActive }) => clsx(s.navigationLink, isActive && s.navigationLinkActive)}
        end={end}
        onClick={onNavigate}
        to={to}
      >
        <Icon aria-hidden="true" className={s.navigationIcon} strokeWidth={2} />
        <span className={s.navigationText}>{label}</span>
      </NavLink>
    </Tooltip>
  );
};
