import { Link, NavLink } from 'react-router-dom';

import { projectConfig } from '@/shared/config/project';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

import s from './PublicHeader.module.scss';
import { publicNavigationItems } from '../model/navigation';

export const PublicHeader = () => {
  return (
    <header className={s.publicHeader}>
      <Link className={s.logo} to={AppRoutes.HOME}>
        Frontend Radar
      </Link>

      <nav aria-label="Public navigation" className={s.navigation}>
        {publicNavigationItems.map((item) => (
          <NavLink className={s.navigationLink} key={item.label} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <a
        className={s.navigationLink}
        href={projectConfig.repositoryUrl}
        rel="noreferrer"
        target="_blank"
      >
        GitHub
      </a>
    </header>
  );
};
