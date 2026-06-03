import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

import s from './DashboardSidebar.module.scss';
import { dashboardNavigationItems } from '../model/navigation';

export const DashboardSidebar = () => {
  return (
    <aside className={s.dashboardSidebar}>
      <nav className={s.navigation} aria-label="Dashboard navigation">
        {dashboardNavigationItems.map((item) => (
          <NavLink
            className={({ isActive }) => clsx(s.navigationLink, isActive && s.navigationLinkActive)}
            end={item.end}
            key={item.label}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
