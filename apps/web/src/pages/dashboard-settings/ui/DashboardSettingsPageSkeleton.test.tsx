import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { reportScoreCategoryOptions } from '@/features/app-settings';

import pageStyles from './DashboardSettingsPage.module.scss';
import { DashboardSettingsPageSkeleton } from './DashboardSettingsPageSkeleton';

describe('DashboardSettingsPageSkeleton', () => {
  test('renders accessible loading status', () => {
    render(<DashboardSettingsPageSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading dashboard settings');
  });

  test('does not render text placeholder', () => {
    render(<DashboardSettingsPageSkeleton />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('marks visual skeleton content as decorative', () => {
    const { container } = render(<DashboardSettingsPageSkeleton />);
    const visualRoot = container.querySelector(`.${pageStyles.page}`);

    expect(visualRoot).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders settings card placeholders', () => {
    render(<DashboardSettingsPageSkeleton />);

    expect(screen.getAllByTestId('dashboard-settings-skeleton-card')).toHaveLength(2);
  });

  test('renders one metric row for each report score category', () => {
    render(<DashboardSettingsPageSkeleton />);

    expect(screen.getAllByTestId('dashboard-settings-skeleton-metric')).toHaveLength(
      reportScoreCategoryOptions.length,
    );
  });
});
