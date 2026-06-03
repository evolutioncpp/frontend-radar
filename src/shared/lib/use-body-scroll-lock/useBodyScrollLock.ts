import { useLayoutEffect } from 'react';

export const useBodyScrollLock = (isLocked: boolean) => {
  useLayoutEffect(() => {
    if (!isLocked) {
      return;
    }

    const scrollY = window.scrollY;

    const originalHtmlScrollBehavior = document.documentElement.style.scrollBehavior;

    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyLeft = document.body.style.left;
    const originalBodyRight = document.body.style.right;
    const originalBodyWidth = document.body.style.width;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.scrollBehavior = 'auto';

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.left = originalBodyLeft;
      document.body.style.right = originalBodyRight;
      document.body.style.width = originalBodyWidth;
      document.body.style.overflow = originalBodyOverflow;

      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);

      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = originalHtmlScrollBehavior;
      });
    };
  }, [isLocked]);
};
