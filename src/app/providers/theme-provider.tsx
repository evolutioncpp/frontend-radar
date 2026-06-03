import { useEffect } from 'react';

import { selectAppTheme } from '@/features/app-settings';
import { useAppSelector } from '@/shared/lib/redux/hooks';

export function ThemeProvider() {
  const theme = useAppSelector(selectAppTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
