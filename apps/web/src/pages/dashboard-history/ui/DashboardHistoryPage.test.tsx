import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { getDemoReportPath } from '@/shared/config/routes/appRoutes';

import { DashboardHistoryPage } from './DashboardHistoryPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
    },
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'page.title': 'History',
        'page.description':
          'Review repository analysis results and reopen reports when you need to revisit project health.',
        'page.emptyTitle': 'No analysis history yet',
        'page.emptyDescription': 'Start a repository analysis from the dashboard overview.',
        'card.label': 'Latest analysis',
        'card.openReportAria': `Open report for ${options?.repository}`,
        'card.scoreLabel': 'Health score',
        'card.summary.metrics': 'Metrics',
        'card.summary.checks': 'Checks',
        'card.summary.recommendations': 'Recommendations',
      };

      if (key === 'card.analyzedAt') {
        return `Analyzed ${options?.date}`;
      }

      return translations[key] ?? key;
    },
  }),
}));

const renderDashboardHistoryPage = () => {
  return render(
    <MemoryRouter>
      <DashboardHistoryPage />
    </MemoryRouter>,
  );
};

const expectSummaryItem = (label: string, value: string) => {
  const summaryItem = screen.getByText(label).closest('div');

  expect(summaryItem).not.toBeNull();
  expect(within(summaryItem as HTMLElement).getByText(value)).toBeInTheDocument();
};

describe('DashboardHistoryPage', () => {
  test('renders compact demo history card', () => {
    renderDashboardHistoryPage();

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByText('Latest analysis')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'evolutioncpp/frontend-radar' }),
    ).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expectSummaryItem('Metrics', '7');
    expectSummaryItem('Checks', '7');
    expectSummaryItem('Recommendations', '3');
    expect(screen.getByText(/Analyzed/i)).toBeInTheDocument();
  });

  test('links to demo report', () => {
    renderDashboardHistoryPage();

    expect(
      screen.getByRole('link', {
        name: 'Open report for evolutioncpp/frontend-radar',
      }),
    ).toHaveAttribute('href', getDemoReportPath());
  });
});
