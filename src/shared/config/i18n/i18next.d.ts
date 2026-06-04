import 'i18next';

import type common from '@locales/en/common.json';
import type dashboard from '@locales/en/dashboard.json';
import type demoReport from '@locales/en/demo-report.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    returnNull: false;
    resources: {
      common: typeof common;
      dashboard: typeof dashboard;
      'demo-report': typeof demoReport;
    };
  }
}
