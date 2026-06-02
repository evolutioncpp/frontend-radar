import { NavLink } from 'react-router-dom';

import s from './DashboardSidebar.module.scss';
import { dashboardNavigationItems } from '../model/navigation';

export const DashboardSidebar = () => {
  return (
    <aside className={s.dashboardSidebar}>
      <nav className={s.dashboardNavigation} aria-label="Dashboard navigation">
        {dashboardNavigationItems.map((item) => (
          <NavLink className={s.navigationLink} end={item.end} key={item.label} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
