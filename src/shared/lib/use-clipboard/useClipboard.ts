import { useCallback, useEffect, useRef, useState } from 'react';

type ClipboardStatus = 'idle' | 'copied' | 'error';

interface UseClipboardOptions {
  resetDelay?: number;
}

const copyTextWithFallback = (value: string) => {
  const textarea = document.createElement('textarea');

  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';

  document.body.append(textarea);
  textarea.select();

  const isCopied = document.execCommand('copy');

  textarea.remove();

  if (!isCopied) {
    throw new Error('Failed to copy text.');
  }
};

export const useClipboard = ({ resetDelay = 1500 }: UseClipboardOptions = {}) => {
  const [status, setStatus] = useState<ClipboardStatus>('idle');
  const resetTimeoutRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');

    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (value: string) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          copyTextWithFallback(value);
        }

        setStatus('copied');

        if (resetTimeoutRef.current !== null) {
          window.clearTimeout(resetTimeoutRef.current);
        }

        resetTimeoutRef.current = window.setTimeout(() => {
          setStatus('idle');
          resetTimeoutRef.current = null;
        }, resetDelay);

        return true;
      } catch {
        setStatus('error');

        if (resetTimeoutRef.current !== null) {
          window.clearTimeout(resetTimeoutRef.current);
        }

        resetTimeoutRef.current = window.setTimeout(() => {
          setStatus('idle');
          resetTimeoutRef.current = null;
        }, resetDelay);

        return false;
      }
    },
    [resetDelay],
  );

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  return {
    copy,
    hasError: status === 'error',
    isCopied: status === 'copied',
    reset,
    status,
  };
};
