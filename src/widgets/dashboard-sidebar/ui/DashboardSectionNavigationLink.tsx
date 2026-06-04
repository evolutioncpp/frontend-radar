import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/shared/ui/Tooltip';

import s from './DashboardSidebar.module.scss';
import { navigationIcons } from '../model/navigationIcons';
import { navigationLabelKeys } from '../model/navigationLabelKeys';

import type { DashboardNavigationIcon } from '../model/navigation';
import type { MouseEvent } from 'react';

interface DashboardSectionNavigationLinkProps {
  href: string;
  icon: DashboardNavigationIcon;
  isCollapsed: boolean;
  isTooltipDisabled: boolean;
  onNavigate?: () => void;
  onSectionNavigate?: (href: string) => void;
}

export const DashboardSectionNavigationLink = ({
  href,
  icon,
  isCollapsed,
  isTooltipDisabled,
  onNavigate,
  onSectionNavigate,
}: DashboardSectionNavigationLinkProps) => {
  const { t } = useTranslation('dashboard');

  const Icon = navigationIcons[icon];
  const label = t(navigationLabelKeys[icon]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onSectionNavigate) {
      onNavigate?.();
      return;
    }

    event.preventDefault();
    onSectionNavigate(href);
  };

  return (
    <Tooltip
      align="center"
      className={clsx(s.sidebarTooltip, isCollapsed && s.sidebarTooltipCollapsed)}
      content={label}
      disabled={isTooltipDisabled}
      isFullWidth
      side="right"
    >
      <a aria-label={label} className={s.sectionNavigationLink} href={href} onClick={handleClick}>
        <Icon aria-hidden="true" className={s.sectionNavigationIcon} strokeWidth={2} />
        <span className={s.sectionNavigationText}>{label}</span>
      </a>
    </Tooltip>
  );
};
