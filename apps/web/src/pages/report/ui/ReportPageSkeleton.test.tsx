import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { reportScoreCategoryOptions } from '@/features/app-settings';

import pageStyles from './ReportPage.module.scss';
import { ReportPageSkeleton } from './ReportPageSkeleton';

describe('ReportPageSkeleton', () => {
  test('renders accessible loading status', () => {
    render(<ReportPageSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading report page');
  });

  test('does not render text placeholder', () => {
    render(<ReportPageSkeleton />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('marks visual skeleton content as decorative', () => {
    const { container } = render(<ReportPageSkeleton />);
    const visualRoot = container.querySelector(`.${pageStyles.reportPage}`);

    expect(visualRoot).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders stable report section placeholders without comparison section', () => {
    render(<ReportPageSkeleton />);

    expect(screen.getAllByTestId('report-page-skeleton-section')).toHaveLength(6);
    expect(screen.queryByTestId('report-page-skeleton-comparison')).not.toBeInTheDocument();
  });

  test('renders one metric row for each report score category', () => {
    render(<ReportPageSkeleton />);

    expect(screen.getAllByTestId('report-page-skeleton-metric')).toHaveLength(
      reportScoreCategoryOptions.length,
    );
  });
});
