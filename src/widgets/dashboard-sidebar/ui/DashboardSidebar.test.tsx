import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { DashboardSectionIds } from '@/shared/config/navigation/dashboardSections';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

import { DashboardSidebar } from './DashboardSidebar';
import { dashboardSectionNavigationItems } from '../model/navigation';

vi.mock('@/features/app-settings', () => ({
  LanguageSwitcher: () => (
    <button aria-label="Switch language" type="button">
      Language
    </button>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'sidebar.dashboardNavigation': 'Dashboard navigation',
        'sidebar.pageNavigation': 'Page navigation',
        'sidebar.onThisPage': 'On this page',

        'sidebar.items.overview': 'Overview',
        'sidebar.items.history': 'History',
        'sidebar.items.settings': 'Settings',
        'sidebar.items.repository': 'Repository',
        'sidebar.items.healthScore': 'Health score',
        'sidebar.items.metrics': 'Metrics',
        'sidebar.items.checks': 'Checks',
        'sidebar.items.recommendations': 'Recommendations',
      };

      return translations[key] ?? key;
    },
  }),
}));

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

  test('does not render page navigation without section items', () => {
    renderSidebar();

    expect(screen.queryByRole('navigation', { name: 'Page navigation' })).not.toBeInTheDocument();
    expect(screen.queryByText('On this page')).not.toBeInTheDocument();
  });

  test('renders page navigation with section items', () => {
    renderSidebar({ sectionNavigationItems: dashboardSectionNavigationItems });

    expect(screen.getByRole('navigation', { name: 'Page navigation' })).toBeInTheDocument();
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  test('renders dashboard section links', () => {
    renderSidebar({ sectionNavigationItems: dashboardSectionNavigationItems });

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

    renderSidebar({ onNavigate, sectionNavigationItems: dashboardSectionNavigationItems });

    fireEvent.click(screen.getByRole('link', { name: 'Metrics' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  test('calls onSectionNavigate when page navigation link is clicked', () => {
    const onNavigate = vi.fn();
    const onSectionNavigate = vi.fn();

    renderSidebar({
      onNavigate,
      onSectionNavigate,
      sectionNavigationItems: dashboardSectionNavigationItems,
    });

    fireEvent.click(screen.getByRole('link', { name: 'Metrics' }));

    expect(onSectionNavigate).toHaveBeenCalledWith(`#${DashboardSectionIds.METRICS}`);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test('renders language switcher', () => {
    renderSidebar();

    expect(screen.getByRole('button', { name: 'Switch language' })).toBeInTheDocument();
  });

  test('does not render native title attributes for collapsed navigation links', () => {
    renderSidebar({ isCollapsed: true, sectionNavigationItems: dashboardSectionNavigationItems });

    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('title');
    expect(screen.getByRole('link', { name: 'Metrics' })).not.toHaveAttribute('title');
  });

  test('renders custom tooltip for collapsed navigation links', () => {
    renderSidebar({ isCollapsed: true, sectionNavigationItems: dashboardSectionNavigationItems });

    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Overview' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent('Overview');
  });
});
