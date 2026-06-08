import { DEMO_REPORT_ID } from '@/shared/config/routes/appRoutes';

import { useDemoReport } from './demoReport';

import type { ProjectReport } from './types';

export type ProjectReportState =
  | {
      status: 'ready';
      report: ProjectReport;
    }
  | {
      status: 'notFound';
    };

export const useProjectReport = (reportId?: string): ProjectReportState => {
  const demoReport = useDemoReport();

  if (reportId === DEMO_REPORT_ID) {
    return {
      status: 'ready',
      report: demoReport,
    };
  }

  return {
    status: 'notFound',
  };
};
