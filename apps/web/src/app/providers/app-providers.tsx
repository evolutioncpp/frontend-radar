import { I18nProvider } from './i18n-provider';
import { StoreProvider } from './store-provider';
import { ThemeProvider } from './theme-provider';

import type { ReactNode } from 'react';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StoreProvider>
      <ThemeProvider />
      <I18nProvider />
      {children}
    </StoreProvider>
  );
}
