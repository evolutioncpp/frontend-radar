import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  test('renders label and title', () => {
    render(<SectionHeader label="Score breakdown" title="Quality metrics" />);

    expect(screen.getByText('Score breakdown')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quality metrics' })).toBeInTheDocument();
  });

  test('renders action when provided', () => {
    render(
      <SectionHeader
        action={
          <button aria-label="Copy section link" type="button">
            Copy
          </button>
        }
        label="Project checks"
        title="Quality signals"
      />,
    );

    expect(screen.getByRole('button', { name: 'Copy section link' })).toBeInTheDocument();
  });

  test('renders aside when provided', () => {
    render(
      <SectionHeader
        aside={<span>7 checks</span>}
        label="Project checks"
        title="Quality signals"
      />,
    );

    expect(screen.getByText('7 checks')).toBeInTheDocument();
  });
});
