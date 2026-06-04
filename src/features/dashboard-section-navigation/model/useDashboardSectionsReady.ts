import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

interface DashboardSectionNavigationOutletContext {
  onDashboardSectionsReady?: () => void;
}

export const useDashboardSectionsReady = () => {
  const context = useOutletContext<DashboardSectionNavigationOutletContext | null>();

  useEffect(() => {
    context?.onDashboardSectionsReady?.();
  }, [context]);
};
