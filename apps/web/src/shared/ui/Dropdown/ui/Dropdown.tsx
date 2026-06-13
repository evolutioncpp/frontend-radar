import clsx from 'clsx';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import s from './Dropdown.module.scss';

import type { ReactNode } from 'react';

type DropdownSide = 'top' | 'right' | 'bottom' | 'left';
type DropdownAlign = 'start' | 'center' | 'end';

interface DropdownRenderApi {
  close: () => void;
}

interface DropdownProps {
  ariaLabel: string;
  trigger: ReactNode;
  children: ReactNode | ((api: DropdownRenderApi) => ReactNode);
  side?: DropdownSide;
  align?: DropdownAlign;
  sideOffset?: number;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

interface DropdownPosition {
  top: number;
  left: number;
}

const viewportPadding = 8;
const menuItemSelector = [
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  'button:not([disabled])',
  'a[href]',
].join(',');

export const Dropdown = ({
  align = 'start',
  ariaLabel,
  children,
  className,
  contentClassName,
  side = 'bottom',
  sideOffset = 8,
  trigger,
  triggerClassName,
}: DropdownProps) => {
  const contentId = useId();
  const closeTimeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const closeAndFocusTrigger = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const getMenuItems = useCallback(() => {
    const contentElement = contentRef.current;

    if (!contentElement) {
      return [];
    }

    return Array.from(contentElement.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
      (element) =>
        !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true',
    );
  }, []);

  const focusMenuItem = useCallback(
    (index: number) => {
      const menuItems = getMenuItems();

      if (menuItems.length === 0) {
        return;
      }

      const nextIndex = (index + menuItems.length) % menuItems.length;
      menuItems[nextIndex]?.focus();
    },
    [getMenuItems],
  );

  const focusFirstMenuItem = useCallback(() => {
    requestAnimationFrame(() => focusMenuItem(0));
  }, [focusMenuItem]);

  const focusLastMenuItem = useCallback(() => {
    requestAnimationFrame(() => {
      const menuItems = getMenuItems();

      focusMenuItem(menuItems.length - 1);
    });
  }, [focusMenuItem, getMenuItems]);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openDropdown = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimeout();

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 120);
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
  }, [close, closeAndFocusTrigger, isOpen]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  const content =
    typeof children === 'function'
      ? children({
          close,
        })
      : children;

  return (
    <span
      className={clsx(s.dropdown, className)}
      onMouseEnter={openDropdown}
      onMouseLeave={scheduleClose}
    >
      <button
        aria-controls={isOpen ? contentId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className={clsx(s.trigger, triggerClassName)}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openDropdown();
            focusFirstMenuItem();
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            openDropdown();
            focusLastMenuItem();
          }
        }}
        ref={triggerRef}
        type="button"
      >
        {trigger}
      </button>

      {isOpen
        ? createPortal(
            <div
              className={clsx(s.content, contentClassName)}
              id={contentId}
              onKeyDown={(event) => {
                const menuItems = getMenuItems();
                const currentIndex = menuItems.findIndex(
                  (element) => element === document.activeElement,
                );

                if (event.key === 'Escape') {
                  event.preventDefault();
                  closeAndFocusTrigger();
                  return;
                }

                if (event.key === 'Tab') {
                  close();
                  return;
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  focusMenuItem(currentIndex + 1);
                  return;
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  focusMenuItem(currentIndex - 1);
                  return;
                }

                if (event.key === 'Home') {
                  event.preventDefault();
                  focusMenuItem(0);
                  return;
                }

                if (event.key === 'End') {
                  event.preventDefault();
                  focusMenuItem(menuItems.length - 1);
                }
              }}
              onMouseEnter={openDropdown}
              onMouseLeave={scheduleClose}
              ref={contentRef}
              role="menu"
              style={{
                left: position?.left ?? 0,
                top: position?.top ?? 0,
              }}
              tabIndex={-1}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
};
