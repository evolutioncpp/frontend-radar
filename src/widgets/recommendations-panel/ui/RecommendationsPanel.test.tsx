import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { RecommendationsPanel } from './RecommendationsPanel';

import type { ReportRecommendation } from '@/entities/report';

const recommendations: ReportRecommendation[] = [
  {
    id: 'add-github-actions',
    severity: 'high',
    title: 'Add GitHub Actions pipeline',
    description:
      'Run lint, build, unit tests and e2e tests on every pull request to prevent regressions.',
  },
  {
    id: 'add-storybook',
    severity: 'medium',
    title: 'Document UI components with Storybook',
    description: 'Add stories for shared UI components and important dashboard states.',
  },
  {
    id: 'add-env-example',
    severity: 'low',
    title: 'Add .env.example',
    description:
      'Document required environment variables so contributors can run the project locally.',
  },
];

describe('RecommendationsPanel', () => {
  test('renders recommendations section title', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getByText('Next steps')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recommendations' })).toBeInTheDocument();
  });

  test('renders recommendations counter', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getByText('3 recommendations')).toBeInTheDocument();
  });

  test('renders recommendations list', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getByRole('list', { name: 'Recommendations list' })).toBeInTheDocument();
  });

  test('renders all recommendations as list items', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(recommendations.length);
  });

  test('renders recommendation titles', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getByText('Add GitHub Actions pipeline')).toBeInTheDocument();
    expect(screen.getByText('Document UI components with Storybook')).toBeInTheDocument();
    expect(screen.getByText('Add .env.example')).toBeInTheDocument();
  });

  test('renders recommendation descriptions', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(
      screen.getByText(
        'Run lint, build, unit tests and e2e tests on every pull request to prevent regressions.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Add stories for shared UI components and important dashboard states.'),
    ).toBeInTheDocument();
  });

  test('renders severity labels', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  test('renders empty state when recommendations list is empty', () => {
    render(<RecommendationsPanel recommendations={[]} />);

    expect(screen.getByText('0 recommendations')).toBeInTheDocument();
    expect(screen.getByText('No recommendations for now.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Recommendations list' })).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
