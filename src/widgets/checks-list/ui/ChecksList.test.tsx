import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ChecksList } from './ChecksList';

import type { ReportCheck } from '@/entities/report';

const checks: ReportCheck[] = [
  {
    id: 'readme-exists',
    label: 'README exists',
    status: 'passed',
  },
  {
    id: 'storybook-missing',
    label: 'Storybook is not configured',
    status: 'warning',
    description: 'Storybook can help document and test UI components in isolation.',
  },
  {
    id: 'env-example-missing',
    label: '.env.example is missing',
    status: 'failed',
    description: 'Document required environment variables for local setup.',
  },
];

describe('ChecksList', () => {
  test('renders checks section title', () => {
    render(<ChecksList checks={checks} />);

    expect(screen.getByText('Project checks')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quality signals' })).toBeInTheDocument();
  });

  test('renders checks counter', () => {
    render(<ChecksList checks={checks} />);

    expect(screen.getByText('3 checks')).toBeInTheDocument();
  });

  test('renders checks list', () => {
    render(<ChecksList checks={checks} />);

    expect(screen.getByRole('list', { name: 'Project checks list' })).toBeInTheDocument();
  });

  test('renders all checks as list items', () => {
    render(<ChecksList checks={checks} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(checks.length);
  });

  test('renders check labels', () => {
    render(<ChecksList checks={checks} />);

    expect(screen.getByText('README exists')).toBeInTheDocument();
    expect(screen.getByText('Storybook is not configured')).toBeInTheDocument();
    expect(screen.getByText('.env.example is missing')).toBeInTheDocument();
  });

  test('renders check descriptions when provided', () => {
    render(<ChecksList checks={checks} />);

    expect(
      screen.getByText('Storybook can help document and test UI components in isolation.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Document required environment variables for local setup.'),
    ).toBeInTheDocument();
  });

  test('renders status labels', () => {
    render(<ChecksList checks={checks} />);

    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  test('renders zero counter when checks list is empty', () => {
    render(<ChecksList checks={[]} />);

    expect(screen.getByText('0 checks')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Project checks list' })).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
