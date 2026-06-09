import 'i18next';

import type common from '@locales/en/common.json';
import type dashboardHistory from '@locales/en/dashboard-history.json';
import type dashboard from '@locales/en/dashboard.json';
import type repositoryAnalysis from '@locales/en/repository-analysis.json';
import type routeError from '@locales/en/route-error.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    returnNull: false;
    resources: {
      common: typeof common;
      dashboard: typeof dashboard;
      'dashboard-history': typeof dashboardHistory;
      'repository-analysis': typeof repositoryAnalysis;
      'route-error': typeof routeError;
    };
  }
}
