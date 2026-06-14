import { useCallback } from 'react';

import type { KeyboardEvent, MutableRefObject } from 'react';

const menuItemSelector = [
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  'button:not([disabled])',
  'a[href]',
].join(',');

export const useDropdownMenuNavigation = ({
  close,
  closeAndFocusTrigger,
  contentRef,
}: {
  close: () => void;
  closeAndFocusTrigger: () => void;
  contentRef: MutableRefObject<HTMLDivElement | null>;
}) => {
  const getMenuItems = useCallback(() => {
    const contentElement = contentRef.current;

    if (!contentElement) {
      return [];
    }

    return Array.from(contentElement.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
      (element) =>
        !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true',
    );
  }, [contentRef]);

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

  const handleMenuKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const menuItems = getMenuItems();
      const currentIndex = menuItems.findIndex((element) => element === document.activeElement);

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
    },
    [close, closeAndFocusTrigger, focusMenuItem, getMenuItems],
  );

  return {
    focusFirstMenuItem,
    focusLastMenuItem,
    handleMenuKeyDown,
  };
};
