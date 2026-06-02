import { Link } from 'react-router-dom';

import { projectConfig } from '@/shared/config/project';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

import s from './DashboardHeader.module.scss';

export const DashboardHeader = () => {
  return (
    <header className={s.dashboardHeader}>
      <Link to={AppRoutes.HOME}>{projectConfig.name}</Link>

      <a href={projectConfig.repositoryUrl} rel="noreferrer" target="_blank">
        Github
      </a>
    </header>
  );
};
