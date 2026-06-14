import { useEffect } from 'react';

import type { MutableRefObject } from 'react';

export const useDropdownDismiss = ({
  close,
  closeAndFocusTrigger,
  contentRef,
  isOpen,
  triggerRef,
}: {
  close: () => void;
  closeAndFocusTrigger: () => void;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) {
        return;
      }

      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAndFocusTrigger();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, closeAndFocusTrigger, contentRef, isOpen, triggerRef]);
};
