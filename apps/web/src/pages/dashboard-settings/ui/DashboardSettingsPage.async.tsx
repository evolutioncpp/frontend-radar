import { lazy, Suspense } from 'react';

import { DashboardSettingsPageSkeleton } from './DashboardSettingsPageSkeleton';

const DashboardSettingsPageLazy = lazy(() =>
  import('./DashboardSettingsPage').then((m) => ({ default: m.DashboardSettingsPage })),
);

export const DashboardSettingsPageAsync = () => {
  return (
    <Suspense fallback={<DashboardSettingsPageSkeleton />}>
      <DashboardSettingsPageLazy />
    </Suspense>
  );
};
