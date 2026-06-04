import 'i18next';

import type common from '@locales/en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    returnNull: false;
    resources: {
      common: typeof common;
    };
  }
}
