import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { projectConfig } from '@/shared/config/project';
import { AppRoutes } from '@/shared/config/routes/appRoutes';

import { DashboardHeader } from './DashboardHeader';

vi.mock('@/features/app-settings', () => ({
  ThemeToggle: () => (
    <button aria-label="Switch to light theme" type="button">
      Theme
    </button>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'header.openRepository': 'View on GitHub',
        'header.openRepositoryAria': 'Open Frontend Radar repository on GitHub',
        'header.collapseSidebar': 'Collapse sidebar',
        'header.expandSidebar': 'Expand sidebar',
        'header.openNavigation': 'Open navigation',
        'header.closeNavigation': 'Close navigation',
      };

      return translations[key] ?? key;
    },
  }),
}));

const renderHeader = (props?: React.ComponentProps<typeof DashboardHeader>) => {
  return render(
    <MemoryRouter>
      <DashboardHeader {...props} />
    </MemoryRouter>,
  );
};

describe('DashboardHeader', () => {
  test('renders project logo link', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: projectConfig.name })).toHaveAttribute(
      'href',
      AppRoutes.DASHBOARD,
    );
  });

  test('renders github link', () => {
    renderHeader();

    expect(
      screen.getByRole('link', { name: 'Open Frontend Radar repository on GitHub' }),
    ).toHaveAttribute('href', projectConfig.repositoryUrl);
  });

  test('renders theme toggle', () => {
    renderHeader();

    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  test('renders collapse sidebar button by default', () => {
    renderHeader();

    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
  });

  test('renders expand sidebar button when sidebar is collapsed', () => {
    renderHeader({ isSidebarCollapsed: true });

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  test('calls onToggleSidebar when desktop sidebar button is clicked', () => {
    const onToggleSidebar = vi.fn();

    renderHeader({ onToggleSidebar });

    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  test('renders open navigation button by default', () => {
    renderHeader();

    expect(screen.getByLabelText('Open navigation', { selector: 'button' })).toBeInTheDocument();
  });

  test('renders close navigation button when mobile sidebar is open', () => {
    renderHeader({ isMobileSidebarOpen: true });

    expect(screen.getByLabelText('Close navigation', { selector: 'button' })).toBeInTheDocument();
  });

  test('calls onToggleMobileSidebar when mobile navigation button is clicked', () => {
    const onToggleMobileSidebar = vi.fn();

    renderHeader({ onToggleMobileSidebar });

    fireEvent.click(screen.getByLabelText('Open navigation', { selector: 'button' }));

    expect(onToggleMobileSidebar).toHaveBeenCalledTimes(1);
  });
});
