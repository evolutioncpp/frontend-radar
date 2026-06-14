import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { RecommendationsPanel } from './RecommendationsPanel';

import type { ReportRecommendation } from '@/entities/report';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'recommendations.label': 'Next steps',
        'recommendations.title': 'Recommendations',
        'recommendations.listAria': 'Recommendations list',
        'recommendations.groupListAria': `${options?.group} recommendations`,
        'recommendations.empty': 'No recommendations for now.',
        'recommendations.groups.first': 'High priority',
        'recommendations.groups.next': 'Medium priority',
        'recommendations.groups.later': 'Low priority',
        'recommendations.impact.key': 'Key impact',
        'recommendations.impact.important': 'Important',
        'recommendations.impact.supporting': 'Supporting',
        'recommendations.effort.small': 'Small effort',
        'recommendations.effort.medium': 'Medium effort',
        'recommendations.effort.large': 'Large effort',
        'recommendations.categories.accessibility': 'Accessibility',
        'recommendations.categories.ci': 'CI/CD',
        'recommendations.categories.documentation': 'Documentation',
        'statuses.high': 'High',
        'statuses.medium': 'Medium',
        'statuses.low': 'Low',
      };

      if (key === 'recommendations.counter') {
        return `${options?.count} ${options?.count === 1 ? 'recommendation' : 'recommendations'}`;
      }

      if (key === 'recommendations.source') {
        return `Source: ${options?.source}`;
      }

      return translations[key] ?? key;
    },
  }),
}));

const recommendations: ReportRecommendation[] = [
  {
    id: 'add-github-actions',
    severity: 'high',
    categories: ['ci'],
    checkIds: ['github-actions'],
    impactLevel: 'key',
    effort: 'medium',
    title: 'Add GitHub Actions pipeline',
    description:
      'Run lint, build, unit tests and e2e tests on every pull request to prevent regressions.',
    action: 'Create a GitHub Actions workflow.',
    source: '.github/workflows',
  },
  {
    id: 'add-storybook',
    severity: 'medium',
    categories: ['accessibility'],
    checkIds: ['a11y-tooling'],
    impactLevel: 'important',
    effort: 'medium',
    title: 'Document UI components with Storybook',
    description: 'Add stories for shared UI components and important dashboard states.',
    action: 'Add stories for key states.',
  },
  {
    id: 'add-env-example',
    severity: 'low',
    categories: ['documentation'],
    checkIds: ['env-example'],
    impactLevel: 'supporting',
    effort: 'small',
    title: 'Add .env.example',
    description:
      'Document required environment variables so contributors can run the project locally.',
    action: 'Create .env.example with placeholder values.',
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

    expect(screen.getByRole('list', { name: 'High priority recommendations' })).toBeInTheDocument();
  });

  test('renders all recommendations as list items', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(recommendations.length);
  });

  test('groups recommendations by next-step priority', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getByRole('heading', { name: 'High priority' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Medium priority' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Low priority' })).toBeInTheDocument();
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

  test('renders recommendation actions and metadata', () => {
    render(<RecommendationsPanel recommendations={recommendations} />);

    expect(screen.getByText('Create a GitHub Actions workflow.')).toBeInTheDocument();
    expect(screen.getByText('Key impact')).toBeInTheDocument();
    expect(screen.getAllByText('Medium effort')).not.toHaveLength(0);
    expect(screen.getByText('CI/CD')).toBeInTheDocument();
    expect(screen.getByText('Source: .github/workflows')).toBeInTheDocument();
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
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
