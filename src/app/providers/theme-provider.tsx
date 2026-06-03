import { useLayoutEffect } from 'react';

import { selectAppTheme } from '@/features/app-settings';
import { useAppSelector } from '@/shared/lib/redux/hooks';

export function ThemeProvider() {
  const theme = useAppSelector(selectAppTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return null;
}
