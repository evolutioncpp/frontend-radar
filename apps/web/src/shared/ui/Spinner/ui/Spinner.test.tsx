import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  test('renders decorative spinner without label', () => {
    const { container } = render(<Spinner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  test('renders accessible status when label is provided', () => {
    render(<Spinner label="Loading report" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading report');
  });

  test('supports size and custom className', () => {
    render(<Spinner className="custom-spinner" label="Loading report" size="lg" />);

    expect(screen.getByRole('status')).toHaveClass('custom-spinner');
  });
});
