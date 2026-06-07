import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { AppRoutes } from '@/shared/config/routes/appRoutes';

import { ReportPage } from './ReportPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'page.reportAria': 'Dashboard report',
        'page.reportFallback.title': 'Report not found',
        'page.reportFallback.description':
          'This report is not available yet. Start a new analysis from the dashboard overview.',
        'page.sections.repository': 'Repository summary',
        'page.sections.healthScore': 'Health score',
        'page.sections.metrics': 'Quality metrics',
        'page.sections.checks': 'Project checks',
        'page.sections.recommendations': 'Recommendations',
        'page.copySectionTitle': 'Copy section link',
        'page.copied': 'Copied',

        'repository.label': 'Repository',
        'repository.openRepository': 'Open repository',
        'repository.metadataAria': 'Repository metadata',
        'repository.metadata.stars': 'Stars',
        'repository.metadata.forks': 'Forks',
        'repository.metadata.branch': 'Branch',
        'repository.metadata.license': 'License',
        'repository.metadata.unknown': 'Unknown',

        'healthScore.label': 'Frontend Health Score',
        'healthScore.title': 'Overall project quality',
        'healthScore.description':
          'This score summarizes repository setup, documentation, testing, CI/CD, dependencies and maintainability signals.',
        'healthScore.progressAria': 'Frontend health score progress',

        'metrics.label': 'Score breakdown',
        'metrics.title': 'Quality metrics',
        'metrics.listAria': 'Metrics list',

        'checks.label': 'Project checks',
        'checks.title': 'Quality signals',
        'checks.listAria': 'Project checks list',

        'recommendations.label': 'Next steps',
        'recommendations.title': 'Recommendations',
        'recommendations.listAria': 'Recommendations list',
        'recommendations.empty': 'No recommendations for now.',

        'statuses.excellent': 'Excellent',
        'statuses.good': 'Good',
        'statuses.warning': 'Warning',
        'statuses.critical': 'Critical',
        'statuses.passed': 'Passed',
        'statuses.failed': 'Failed',
        'statuses.high': 'High',
        'statuses.medium': 'Medium',
        'statuses.low': 'Low',
      };

      if (key === 'page.copySectionLink') {
        return `Copy link to ${options?.section} section`;
      }

      if (key === 'healthScore.scoreAria') {
        return `Frontend health score ${options?.score} out of 100`;
      }

      if (key === 'metrics.counter') {
        return `${options?.count} ${options?.count === 1 ? 'metric' : 'metrics'}`;
      }

      if (key === 'checks.counter') {
        return `${options?.count} ${options?.count === 1 ? 'check' : 'checks'}`;
      }

      if (key === 'recommendations.counter') {
        return `${options?.count} ${options?.count === 1 ? 'recommendation' : 'recommendations'}`;
      }

      if (key === 'metrics.scoreAria') {
        return `${options?.label} score ${options?.score} out of ${options?.max}`;
      }

      if (key === 'metrics.progressAria') {
        return `${options?.label} score progress`;
      }

      return translations[key] ?? key;
    },
  }),
}));

const renderReportPage = (initialEntry: string) => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ReportPage />} path={AppRoutes.REPORT} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ReportPage', () => {
  test('renders demo report for demo id', () => {
    renderReportPage('/dashboard/report/demo');

    expect(
      screen.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Overall project quality' })).toBeInTheDocument();
  });

  test('renders fallback for unknown report id', () => {
    renderReportPage('/dashboard/report/unknown');

    expect(screen.getByRole('heading', { name: 'Report not found' })).toBeInTheDocument();
    expect(screen.getByText(/This report is not available yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/evolutioncpp\/frontend-radar/i)).not.toBeInTheDocument();
  });
});
