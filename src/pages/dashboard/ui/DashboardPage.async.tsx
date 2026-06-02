import { lazy, Suspense } from 'react';

import { DashboardPageSkeleton } from './DashboardPageSkeleton';

const DashboardPageLazy = lazy(() =>
  import('./DashboardPage').then((m) => ({ default: m.DashboardPage })),
);

export const DashboardPageAsync = () => {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardPageLazy />
    </Suspense>
  );
};
