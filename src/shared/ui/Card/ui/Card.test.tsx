import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Card } from './Card';

describe('Card', () => {
  test('renders children', () => {
    render(<Card>Card content</Card>);

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Card className="custom-card">Card content</Card>);

    expect(screen.getByText('Card content')).toHaveClass('custom-card');
  });

  test('supports outlined variant', () => {
    render(<Card variant="outlined">Card content</Card>);

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });
});
