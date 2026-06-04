import { useEffect } from 'react';

import { hasStoredAppLanguage, selectAppLanguage, setLanguage } from '@/features/app-settings';
import { i18n, normalizeSupportedLanguage } from '@/shared/config/i18n';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';

export function I18nProvider() {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectAppLanguage);

  useEffect(() => {
    if (!hasStoredAppLanguage()) {
      const detectedLanguage = normalizeSupportedLanguage(i18n.resolvedLanguage ?? i18n.language);

      if (detectedLanguage !== language) {
        dispatch(setLanguage(detectedLanguage));
        return;
      }
    }

    document.documentElement.lang = language;

    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language);
    }
  }, [dispatch, language]);

  return null;
}
