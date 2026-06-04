import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { RepositorySummary } from './RepositorySummary';

import type { ReportRepository } from '@/entities/report';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'repository.label': 'Repository',
        'repository.openRepository': 'Open repository',
        'repository.metadataAria': 'Repository metadata',
        'repository.metadata.stars': 'Stars',
        'repository.metadata.forks': 'Forks',
        'repository.metadata.branch': 'Branch',
        'repository.metadata.license': 'License',
        'repository.metadata.unknown': 'Unknown',
      };

      return translations[key] ?? key;
    },
  }),
}));

const repository: ReportRepository = {
  owner: 'evolutioncpp',
  name: 'frontend-radar',
  url: 'https://github.com/evolutioncpp/frontend-radar',
  description: 'A frontend project health dashboard for analyzing repository quality and tooling.',
  stars: 128,
  forks: 14,
  defaultBranch: 'main',
  latestCommitDate: '2026-06-02T00:00:00.000Z',
  license: 'MIT',
};

describe('RepositorySummary', () => {
  test('renders repository full name', () => {
    render(<RepositorySummary repository={repository} />);

    expect(
      screen.getByRole('heading', { name: 'evolutioncpp/frontend-radar' }),
    ).toBeInTheDocument();
  });

  test('renders repository description', () => {
    render(<RepositorySummary repository={repository} />);

    expect(
      screen.getByText(
        'A frontend project health dashboard for analyzing repository quality and tooling.',
      ),
    ).toBeInTheDocument();
  });

  test('renders repository meta information', () => {
    render(<RepositorySummary repository={repository} />);

    expect(screen.getByText('Stars')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();

    expect(screen.getByText('Forks')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();

    expect(screen.getByText('Branch')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();

    expect(screen.getByText('License')).toBeInTheDocument();
    expect(screen.getByText('MIT')).toBeInTheDocument();
  });

  test('renders repository link', () => {
    render(<RepositorySummary repository={repository} />);

    expect(screen.getByRole('link', { name: 'Open repository' })).toHaveAttribute(
      'href',
      repository.url,
    );
  });

  test('renders fallback when license is missing', () => {
    render(<RepositorySummary repository={{ ...repository, license: null }} />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  test('does not render description when it is missing', () => {
    render(<RepositorySummary repository={{ ...repository, description: null }} />);

    expect(
      screen.queryByText(
        'A frontend project health dashboard for analyzing repository quality and tooling.',
      ),
    ).not.toBeInTheDocument();
  });
});
