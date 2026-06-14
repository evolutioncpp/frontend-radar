import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, test } from 'vitest';

import { appSettingsReducer, setDashboardSidebarCollapsed } from '@/features/app-settings';

import layoutStyles from './DashboardLayout.module.scss';
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';

const renderSkeleton = (isDashboardSidebarCollapsed = false) => {
  const store = configureStore({
    reducer: {
      appSettings: appSettingsReducer,
    },
  });

  store.dispatch(setDashboardSidebarCollapsed(isDashboardSidebarCollapsed));

  return render(
    <Provider store={store}>
      <DashboardLayoutSkeleton />
    </Provider>,
  );
};

describe('DashboardLayoutSkeleton', () => {
  test('renders accessible loading status', () => {
    renderSkeleton();

    expect(screen.getByRole('status')).toHaveTextContent('Loading dashboard');
  });

  test('does not render text placeholder', () => {
    renderSkeleton();

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('renders expanded sidebar layout by default', () => {
    const { container } = renderSkeleton();
    const layout = container.querySelector(`.${layoutStyles.dashboardLayout}`);

    expect(layout).toBeInTheDocument();
    expect(layout).not.toHaveClass(layoutStyles.dashboardLayoutCollapsed);
  });

  test('renders collapsed sidebar layout from app settings', () => {
    const { container } = renderSkeleton(true);
    const layout = container.querySelector(`.${layoutStyles.dashboardLayout}`);

    expect(layout).toHaveClass(layoutStyles.dashboardLayoutCollapsed);
  });
});
