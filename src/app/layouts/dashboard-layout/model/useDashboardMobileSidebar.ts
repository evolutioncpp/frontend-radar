import { useEffect, useState } from 'react';

import { useBodyScrollLock } from '@/shared/lib/use-body-scroll-lock';

export const useDashboardMobileSidebar = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useBodyScrollLock(isMobileSidebarOpen);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((currentValue) => !currentValue);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileSidebarOpen]);

  return {
    isMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
  };
};
