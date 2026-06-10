import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  test('renders label and hint', () => {
    render(<Checkbox hint="Optional path" label="Use frontend path" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Use frontend path' });

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAccessibleDescription('Optional path');
  });

  test('supports uncontrolled checking by click', () => {
    render(<Checkbox label="Use frontend path" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Use frontend path' });

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  test('toggles when hint text is clicked', () => {
    render(<Checkbox hint="Optional path" label="Use frontend path" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Use frontend path' });

    fireEvent.click(screen.getByText('Optional path'));

    expect(checkbox).toBeChecked();
  });

  test('supports controlled checked state and onChange', () => {
    const handleChange = vi.fn();

    render(<Checkbox checked label="Use frontend path" onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Use frontend path' });

    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledOnce();
  });

  test('supports disabled state', () => {
    render(<Checkbox disabled label="Use frontend path" />);

    expect(screen.getByRole('checkbox', { name: 'Use frontend path' })).toBeDisabled();
  });

  test('toggles with keyboard interaction', async () => {
    const user = userEvent.setup();

    render(<Checkbox label="Use frontend path" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Use frontend path' });

    checkbox.focus();
    await user.keyboard('[Space]');

    expect(checkbox).toBeChecked();
  });
});
