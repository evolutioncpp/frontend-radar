import { Outlet } from 'react-router-dom';

import { PublicFooter } from '@/widgets/public-footer';
import { PublicHeader } from '@/widgets/public-header';

import s from './PublicLayout.module.scss';

export const PublicLayout = () => {
  return (
    <div className={s.publicLayout}>
      <PublicHeader />

      <main id="main-content">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
};
