import { lazy, Suspense } from 'react';

import { DashboardHistoryPageSkeleton } from './DashboardHistoryPageSkeleton';

const DashboardHistoryPageLazy = lazy(() =>
  import('./DashboardHistoryPage').then((m) => ({ default: m.DashboardHistoryPage })),
);

export const DashboardHistoryPageAsync = () => {
  return (
    <Suspense fallback={<DashboardHistoryPageSkeleton />}>
      <DashboardHistoryPageLazy />
    </Suspense>
  );
};
