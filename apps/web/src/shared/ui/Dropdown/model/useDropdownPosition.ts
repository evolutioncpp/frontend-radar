import { useCallback, useEffect, useState } from 'react';

import type { DropdownAlign, DropdownPosition, DropdownSide } from './dropdownTypes';
import type { MutableRefObject } from 'react';

const viewportPadding = 8;

export const useDropdownPosition = ({
  align,
  contentRef,
  isOpen,
  side,
  sideOffset,
  triggerRef,
}: {
  align: DropdownAlign;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  side: DropdownSide;
  sideOffset: number;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
}) => {
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const updatePosition = useCallback(() => {
    const triggerElement = triggerRef.current;
    const contentElement = contentRef.current;

    if (!triggerElement || !contentElement) {
      return;
    }

    const triggerRect = triggerElement.getBoundingClientRect();
    const contentRect = contentElement.getBoundingClientRect();

    let top = 0;
    let left = 0;

    if (side === 'bottom') {
      top = triggerRect.bottom + sideOffset;

      if (align === 'center') {
        left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      } else if (align === 'end') {
        left = triggerRect.right - contentRect.width;
      } else {
        left = triggerRect.left;
      }
    }

    if (side === 'top') {
      top = triggerRect.top - contentRect.height - sideOffset;

      if (align === 'center') {
        left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      } else if (align === 'end') {
        left = triggerRect.right - contentRect.width;
      } else {
        left = triggerRect.left;
      }
    }

    if (side === 'right') {
      left = triggerRect.right + sideOffset;

      if (align === 'center') {
        top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
      } else if (align === 'end') {
        top = triggerRect.bottom - contentRect.height;
      } else {
        top = triggerRect.top;
      }
    }

    if (side === 'left') {
      left = triggerRect.left - contentRect.width - sideOffset;

      if (align === 'center') {
        top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
      } else if (align === 'end') {
        top = triggerRect.bottom - contentRect.height;
      } else {
        top = triggerRect.top;
      }
    }

    const maxLeft = window.innerWidth - contentRect.width - viewportPadding;
    const maxTop = window.innerHeight - contentRect.height - viewportPadding;

    setPosition({
      left: Math.max(viewportPadding, Math.min(left, maxLeft)),
      top: Math.max(viewportPadding, Math.min(top, maxTop)),
    });
  }, [align, contentRef, side, sideOffset, triggerRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    const animationFrameId = requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return position;
};
