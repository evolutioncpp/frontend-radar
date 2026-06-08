import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Progress } from './Progress';

describe('Progress', () => {
  test('renders progressbar with correct aria attributes', () => {
    render(<Progress value={42} />);

    const progressbar = screen.getByRole('progressbar');

    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow', '42');
  });

  test('supports custom max value', () => {
    render(<Progress max={10} value={4} />);

    const progressbar = screen.getByRole('progressbar');

    expect(progressbar).toHaveAttribute('aria-valuemax', '10');
    expect(progressbar).toHaveAttribute('aria-valuenow', '4');
  });

  test('clamps value below minimum', () => {
    render(<Progress value={-20} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  test('clamps value above maximum', () => {
    render(<Progress value={140} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  test('applies custom className', () => {
    render(<Progress className="custom-progress" value={50} />);

    expect(screen.getByRole('progressbar')).toHaveClass('custom-progress');
  });
});
