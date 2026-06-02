import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  test('renders decorative skeleton element', () => {
    render(<Skeleton data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  });

  test('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveClass('custom-skeleton');
  });

  test('applies size styles', () => {
    render(<Skeleton borderRadius={8} data-testid="skeleton" height={24} width={120} />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({
      width: '120px',
      height: '24px',
      borderRadius: '8px',
    });
  });

  test('merges custom style with size props', () => {
    render(<Skeleton data-testid="skeleton" height={24} style={{ marginTop: 12 }} width="100%" />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({
      width: '100%',
      height: '24px',
      marginTop: '12px',
    });
  });
});
