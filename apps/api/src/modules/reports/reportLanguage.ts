import { getPreferredSupportedLanguage } from '@frontend-radar/localization';

import type { SupportedLanguage } from '@frontend-radar/localization';

export const getReportLanguage = (
  acceptLanguageHeader: string | string[] | undefined,
): SupportedLanguage => {
  const acceptLanguage = Array.isArray(acceptLanguageHeader)
    ? acceptLanguageHeader.join(',')
    : acceptLanguageHeader;

  return getPreferredSupportedLanguage(acceptLanguage);
};
