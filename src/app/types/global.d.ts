import type { appStore } from '@/app/store/store';

declare global {
  type AppStore = typeof appStore;
  type RootState = ReturnType<typeof appStore.getState>;
  type AppDispatch = typeof appStore.dispatch;
}

export {};
