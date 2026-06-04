import clsx from 'clsx';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import s from './Tooltip.module.scss';

import type { ReactNode } from 'react';

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
type TooltipAlign = 'start' | 'center' | 'end';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  sideOffset?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  isFullWidth?: boolean;
}

interface TooltipPosition {
  top: number;
  left: number;
}

const viewportPadding = 8;

const contentSideClassMap: Record<TooltipSide, string> = {
  top: s.contentTop,
  right: s.contentRight,
  bottom: s.contentBottom,
  left: s.contentLeft,
};

export const Tooltip = ({
  align = 'center',
  children,
  className,
  content,
  contentClassName,
  disabled = false,
  isFullWidth = false,
  side = 'top',
  sideOffset = 10,
}: TooltipProps) => {
  const contentId = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const isTooltipVisible = isOpen && !disabled;

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = () => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
  };

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
  }, [align, side, sideOffset]);

  useEffect(() => {
    if (!isTooltipVisible) {
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
  }, [isTooltipVisible, updatePosition]);

  useEffect(() => {
    if (!isTooltipVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, isTooltipVisible]);

  return (
    <>
      <span
        className={clsx(s.tooltip, isFullWidth && s.tooltipFullWidth, className)}
        onBlurCapture={close}
        onFocusCapture={open}
        onMouseEnter={open}
        onMouseLeave={close}
        ref={triggerRef}
      >
        {children}
      </span>

      {isTooltipVisible
        ? createPortal(
            <div
              className={clsx(s.content, contentSideClassMap[side], contentClassName)}
              id={contentId}
              ref={contentRef}
              role="tooltip"
              style={{
                left: position?.left ?? 0,
                top: position?.top ?? 0,
              }}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
