import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import pageStyles from './DashboardPage.module.scss';
import { DashboardPageSkeleton } from './DashboardPageSkeleton';
import { analysisInfoSteps } from '../model/analysisInfoSteps';

describe('DashboardPageSkeleton', () => {
  test('renders accessible loading status', () => {
    render(<DashboardPageSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading dashboard page');
  });

  test('does not render text placeholder', () => {
    render(<DashboardPageSkeleton />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('marks visual skeleton content as decorative', () => {
    const { container } = render(<DashboardPageSkeleton />);
    const visualRoot = container.querySelector(`.${pageStyles.dashboardPage}`);

    expect(visualRoot).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders one skeleton row for each analysis info step', () => {
    render(<DashboardPageSkeleton />);

    expect(screen.getAllByTestId('dashboard-page-skeleton-step')).toHaveLength(
      analysisInfoSteps.length,
    );
  });
});
