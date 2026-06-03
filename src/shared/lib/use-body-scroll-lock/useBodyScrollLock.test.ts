import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useBodyScrollLock } from './useBodyScrollLock';

const resetDocumentStyles = () => {
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
};

describe('useBodyScrollLock', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    resetDocumentStyles();
  });

  test('does not change body styles when lock is disabled', () => {
    const scrollTo = vi.fn();

    vi.stubGlobal('scrollTo', scrollTo);

    document.body.style.position = 'relative';
    document.body.style.overflow = 'auto';

    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.overflow).toBe('auto');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('locks body scroll when enabled', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(240);

    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-240px');
    expect(document.body.style.left).toBe('0px');
    expect(document.body.style.right).toBe('0px');
    expect(document.body.style.width).toBe('100%');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.scrollBehavior).toBe('auto');
  });

  test('restores original body styles after unlock', () => {
    const scrollTo = vi.fn();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    });

    vi.stubGlobal('scrollTo', scrollTo);
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(360);

    document.documentElement.style.scrollBehavior = 'smooth';
    document.body.style.position = 'relative';
    document.body.style.top = '10px';
    document.body.style.left = '5px';
    document.body.style.right = '5px';
    document.body.style.width = '80%';
    document.body.style.overflow = 'auto';

    const { unmount } = renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-360px');

    unmount();

    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.top).toBe('10px');
    expect(document.body.style.left).toBe('5px');
    expect(document.body.style.right).toBe('5px');
    expect(document.body.style.width).toBe('80%');
    expect(document.body.style.overflow).toBe('auto');

    expect(scrollTo).toHaveBeenCalledWith(0, 360);
    expect(requestAnimationFrame).toHaveBeenCalled();
    expect(document.documentElement.style.scrollBehavior).toBe('smooth');
  });

  test('restores scroll position when lock changes from enabled to disabled', () => {
    const scrollTo = vi.fn();

    vi.stubGlobal('scrollTo', scrollTo);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    });

    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(180);

    const { rerender } = renderHook(({ isLocked }) => useBodyScrollLock(isLocked), {
      initialProps: {
        isLocked: true,
      },
    });

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-180px');

    rerender({
      isLocked: false,
    });

    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.overflow).toBe('');
    expect(scrollTo).toHaveBeenCalledWith(0, 180);
  });
});
