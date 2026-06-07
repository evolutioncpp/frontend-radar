import { lazy, Suspense } from 'react';

import { ReportPageSkeleton } from './ReportPageSkeleton';

const ReportPageLazy = lazy(() => import('./ReportPage').then((m) => ({ default: m.ReportPage })));

export const ReportPageAsync = () => {
  return (
    <Suspense fallback={<ReportPageSkeleton />}>
      <ReportPageLazy />
    </Suspense>
  );
};
