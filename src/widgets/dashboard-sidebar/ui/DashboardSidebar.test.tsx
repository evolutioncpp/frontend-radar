import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { DashboardSectionIds } from '@/shared/config/navigation/dashboardSections';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

import { DashboardSidebar } from './DashboardSidebar';

const renderSidebar = (props?: React.ComponentProps<typeof DashboardSidebar>) => {
  return render(
    <MemoryRouter initialEntries={[AppRoutes.DASHBOARD]}>
      <DashboardSidebar {...props} />
    </MemoryRouter>,
  );
};

describe('DashboardSidebar', () => {
  test('renders dashboard navigation', () => {
    renderSidebar();

    expect(screen.getByRole('navigation', { name: 'Dashboard navigation' })).toBeInTheDocument();
  });

  test('renders dashboard navigation links', () => {
    renderSidebar();

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      AppRoutes.DASHBOARD,
    );
  });

  test('renders page navigation', () => {
    renderSidebar();

    expect(screen.getByRole('navigation', { name: 'Page navigation' })).toBeInTheDocument();
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  test('renders dashboard section links', () => {
    renderSidebar();

    expect(screen.getByRole('link', { name: 'Repository' })).toHaveAttribute(
      'href',
      `#${DashboardSectionIds.REPOSITORY}`,
    );

    expect(screen.getByRole('link', { name: 'Health score' })).toHaveAttribute(
      'href',
      `#${DashboardSectionIds.HEALTH_SCORE}`,
    );

    expect(screen.getByRole('link', { name: 'Metrics' })).toHaveAttribute(
      'href',
      `#${DashboardSectionIds.METRICS}`,
    );

    expect(screen.getByRole('link', { name: 'Checks' })).toHaveAttribute(
      'href',
      `#${DashboardSectionIds.CHECKS}`,
    );

    expect(screen.getByRole('link', { name: 'Recommendations' })).toHaveAttribute(
      'href',
      `#${DashboardSectionIds.RECOMMENDATIONS}`,
    );
  });

  test('calls onNavigate when dashboard navigation link is clicked', () => {
    const onNavigate = vi.fn();

    renderSidebar({ onNavigate });

    fireEvent.click(screen.getByRole('link', { name: 'Overview' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  test('calls onNavigate when page navigation link is clicked without section navigation handler', () => {
    const onNavigate = vi.fn();

    renderSidebar({ onNavigate });

    fireEvent.click(screen.getByRole('link', { name: 'Metrics' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  test('calls onSectionNavigate when page navigation link is clicked', () => {
    const onNavigate = vi.fn();
    const onSectionNavigate = vi.fn();

    renderSidebar({ onNavigate, onSectionNavigate });

    fireEvent.click(screen.getByRole('link', { name: 'Metrics' }));

    expect(onSectionNavigate).toHaveBeenCalledWith(`#${DashboardSectionIds.METRICS}`);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
