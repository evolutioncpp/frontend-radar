import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import pageStyles from './DashboardHistoryPage.module.scss';
import { DashboardHistoryPageSkeleton } from './DashboardHistoryPageSkeleton';

describe('DashboardHistoryPageSkeleton', () => {
  test('renders accessible loading status', () => {
    render(<DashboardHistoryPageSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading dashboard history');
  });

  test('does not render text placeholder', () => {
    render(<DashboardHistoryPageSkeleton />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('marks visual skeleton content as decorative', () => {
    const { container } = render(<DashboardHistoryPageSkeleton />);
    const visualRoot = container.querySelector(`.${pageStyles.dashboardHistoryPage}`);

    expect(visualRoot).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders history card placeholders', () => {
    render(<DashboardHistoryPageSkeleton />);

    expect(screen.getAllByTestId('dashboard-history-skeleton-card')).toHaveLength(2);
  });

  test('renders collapsed previous runs panel for the first card', () => {
    render(<DashboardHistoryPageSkeleton />);

    expect(
      screen.getByTestId('dashboard-history-skeleton-previous-runs-panel'),
    ).toBeInTheDocument();
  });
});
