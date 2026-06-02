import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
  test('renders children', () => {
    render(<Badge>Success</Badge>);

    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Badge className="custom-badge">Badge content</Badge>);

    expect(screen.getByText('Badge content')).toHaveClass('custom-badge');
  });

  test('supports variant class', () => {
    render(<Badge variant="success">Passed</Badge>);

    expect(screen.getByText('Passed')).toBeInTheDocument();
  });
});
