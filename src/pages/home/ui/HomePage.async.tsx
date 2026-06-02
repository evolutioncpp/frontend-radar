import { lazy, Suspense } from 'react';

import { HomePageSkeleton } from './HomePageSkeleton';

const HomePageLazy = lazy(() => import('./HomePage').then((m) => ({ default: m.HomePage })));

export const HomePageAsync = () => {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageLazy />
    </Suspense>
  );
};
