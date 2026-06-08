import { Provider } from 'react-redux';

import { appStore } from '@/app/store/store';

import type { ReactNode } from 'react';

type StoreProviderProps = {
  children: ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={appStore}>{children}</Provider>;
}
