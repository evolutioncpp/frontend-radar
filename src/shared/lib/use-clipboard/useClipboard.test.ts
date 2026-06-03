import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('copies text using clipboard api', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const isCopied = await result.current.copy('copied text');

      expect(isCopied).toBe(true);
    });

    expect(writeText).toHaveBeenCalledWith('copied text');
    expect(result.current.isCopied).toBe(true);
    expect(result.current.status).toBe('copied');
  });

  test('resets copied status after delay', async () => {
    vi.useFakeTimers();

    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const { result } = renderHook(() => useClipboard({ resetDelay: 500 }));

    await act(async () => {
      await result.current.copy('copied text');
    });

    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.isCopied).toBe(false);
  });

  test('sets error status when copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Copy failed'));

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const isCopied = await result.current.copy('copied text');

      expect(isCopied).toBe(false);
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.status).toBe('error');
  });

  test('resets status manually', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('copied text');
    });

    expect(result.current.status).toBe('copied');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
  });
});
