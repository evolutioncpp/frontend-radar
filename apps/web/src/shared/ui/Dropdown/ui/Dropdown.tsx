import clsx from 'clsx';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import s from './Dropdown.module.scss';
import { useDropdownDismiss } from '../model/useDropdownDismiss';
import { useDropdownMenuNavigation } from '../model/useDropdownMenuNavigation';
import { useDropdownPosition } from '../model/useDropdownPosition';

import type { DropdownAlign, DropdownSide } from '../model/dropdownTypes';
import type { ReactNode } from 'react';

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

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const closeAndFocusTrigger = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);
  const position = useDropdownPosition({
    align,
    contentRef,
    isOpen,
    side,
    sideOffset,
    triggerRef,
  });
  const { focusFirstMenuItem, focusLastMenuItem, handleMenuKeyDown } = useDropdownMenuNavigation({
    close,
    closeAndFocusTrigger,
    contentRef,
  });

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

  useDropdownDismiss({
    close,
    closeAndFocusTrigger,
    contentRef,
    isOpen,
    triggerRef,
  });

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
              onKeyDown={handleMenuKeyDown}
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
