import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import { DashboardPage } from './DashboardPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'page.label': 'Demo report',
        'page.title': 'Frontend project health overview',
        'page.description':
          'Analyze repository quality, tooling, testing, documentation and delivery readiness in a single dashboard.',
        'page.reportAria': 'Dashboard report',

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

const renderDashboardPage = (initialEntry = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <DashboardPage />
    </MemoryRouter>,
  );
};

describe('DashboardPage', () => {
  test('renders dashboard report content', () => {
    renderDashboardPage();

    expect(
      screen.getByRole('heading', { name: 'Frontend project health overview' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Demo report')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Frontend Health Score/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quality metrics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quality signals' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recommendations' })).toBeInTheDocument();
  });

  test('renders section copy link buttons', () => {
    renderDashboardPage();

    expect(
      screen.getByRole('button', { name: 'Copy link to Repository summary section' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Copy link to Health score section' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Copy link to Quality metrics section' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Copy link to Project checks section' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Copy link to Recommendations section' }),
    ).toBeInTheDocument();
  });
});
