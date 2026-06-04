import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  getActiveDashboardSectionHash,
  getDashboardSectionHref,
  getDashboardSectionIdFromHash,
  isDashboardSectionId,
  navigateToDashboardSection,
  scrollToDashboardSection,
} from './dashboardSectionNavigation';

const sectionNavigationLockDelay = 900;

interface UseDashboardSectionHashSyncOptions {
  readyVersion: number;
}

const getValidatedDashboardSectionHash = (hash: string) => {
  const sectionId = getDashboardSectionIdFromHash(hash);

  return isDashboardSectionId(sectionId) ? getDashboardSectionHref(sectionId) : '';
};

export const useDashboardSectionHashSync = ({
  readyVersion,
}: UseDashboardSectionHashSyncOptions) => {
  const sectionNavigationLockTimeoutRef = useRef<number | null>(null);
  const { hash } = useLocation();
  const isReady = readyVersion > 0;

  const [activeSectionHref, setActiveSectionHref] = useState(() => {
    return getValidatedDashboardSectionHash(window.location.hash);
  });

  const lockSectionNavigation = useCallback(() => {
    if (sectionNavigationLockTimeoutRef.current !== null) {
      window.clearTimeout(sectionNavigationLockTimeoutRef.current);
    }

    sectionNavigationLockTimeoutRef.current = window.setTimeout(() => {
      sectionNavigationLockTimeoutRef.current = null;
    }, sectionNavigationLockDelay);
  }, []);

  const syncActiveSectionFromScroll = useCallback(() => {
    if (!isReady || sectionNavigationLockTimeoutRef.current !== null) {
      return;
    }

    const nextHash = getActiveDashboardSectionHash();

    setActiveSectionHref((currentHash) => {
      return currentHash === nextHash ? currentHash : nextHash;
    });

    if (window.location.hash === nextHash) {
      return;
    }

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}${nextHash}`,
    );
  }, [isReady]);

  const navigateToSection = useCallback(
    (href: string) => {
      const sectionId = href.startsWith('#') ? getDashboardSectionIdFromHash(href) : href;

      if (!isDashboardSectionId(sectionId)) {
        return;
      }

      const nextHash = getDashboardSectionHref(sectionId);

      setActiveSectionHref(nextHash);
      lockSectionNavigation();
      navigateToDashboardSection(nextHash);
    },
    [lockSectionNavigation],
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const nextHash = getValidatedDashboardSectionHash(hash || window.location.hash);

    const animationFrameId = requestAnimationFrame(() => {
      if (!nextHash) {
        syncActiveSectionFromScroll();
        return;
      }

      const sectionId = getDashboardSectionIdFromHash(nextHash);

      setActiveSectionHref(nextHash);
      lockSectionNavigation();
      scrollToDashboardSection(sectionId, 'auto');
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hash, isReady, lockSectionNavigation, readyVersion, syncActiveSectionFromScroll]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let animationFrameId: number | null = null;

    const updateHashFromScroll = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        syncActiveSectionFromScroll();
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

      if (sectionNavigationLockTimeoutRef.current !== null) {
        window.clearTimeout(sectionNavigationLockTimeoutRef.current);
      }

      window.removeEventListener('scroll', updateHashFromScroll);
      window.removeEventListener('resize', updateHashFromScroll);
    };
  }, [isReady, syncActiveSectionFromScroll]);

  return {
    activeSectionHref,
    navigateToSection,
  };
};
