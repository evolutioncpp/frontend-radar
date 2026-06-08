import { render, screen } from '@testing-library/react';
import { Search } from 'lucide-react';
import { describe, expect, test } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  test('renders button content', () => {
    render(<Button>Analyze</Button>);

    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
  });

  test('supports secondary variant and custom className', () => {
    render(
      <Button className="custom-button" variant="secondary">
        Analyze
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Analyze' })).toHaveClass('custom-button');
  });

  test('renders icon', () => {
    render(
      <Button>
        <Search aria-hidden="true" />
        <span>Analyze</span>
      </Button>,
    );

    expect(
      screen.getByRole('button', { name: 'Analyze' }).querySelector('svg'),
    ).toBeInTheDocument();
  });

  test('supports full width mode', () => {
    render(<Button isFullWidth>Analyze</Button>);

    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
  });
});
