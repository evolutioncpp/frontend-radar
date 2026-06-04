import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from 'vitest';

const createStorageMock = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => {
      return store.get(key) ?? null;
    },
    key: (index: number) => {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

const localStorageMock = createStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

afterEach(() => {
  localStorageMock.clear();
});
