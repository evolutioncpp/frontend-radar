import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  getActiveDashboardSectionHash,
  getDashboardSectionIdFromHash,
  scrollToDashboardSection,
} from './dashboardSectionNavigation';

export const useDashboardSectionHashSync = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }

    const sectionId = getDashboardSectionIdFromHash(hash);

    requestAnimationFrame(() => {
      scrollToDashboardSection(sectionId, 'auto');
    });
  }, [hash]);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateHashFromScroll = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;

        const nextHash = getActiveDashboardSectionHash();

        if (window.location.hash === nextHash) {
          return;
        }

        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}${nextHash}`,
        );
      });
    };

    const timeoutId = window.setTimeout(updateHashFromScroll, 150);

    window.addEventListener('scroll', updateHashFromScroll, { passive: true });
    window.addEventListener('resize', updateHashFromScroll);

    return () => {
      window.clearTimeout(timeoutId);

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener('scroll', updateHashFromScroll);
      window.removeEventListener('resize', updateHashFromScroll);
    };
  }, []);
};
