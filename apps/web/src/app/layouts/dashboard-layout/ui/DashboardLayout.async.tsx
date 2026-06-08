import { lazy, Suspense } from 'react';

import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';

const DashboardLayoutLazy = lazy(() =>
  import('./DashboardLayout').then((m) => ({ default: m.DashboardLayout })),
);

export const DashboardLayoutAsync = () => {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <DashboardLayoutLazy />
    </Suspense>
  );
};
