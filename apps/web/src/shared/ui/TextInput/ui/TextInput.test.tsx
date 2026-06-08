import { fireEvent, render, screen } from '@testing-library/react';
import { Search } from 'lucide-react';
import { createRef } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { TextInput } from './TextInput';

describe('TextInput', () => {
  test('renders input with label', () => {
    render(<TextInput label="Repository" placeholder="owner/repo" />);

    expect(screen.getByLabelText('Repository')).toHaveAttribute('placeholder', 'owner/repo');
  });

  test('renders hint and error descriptions', () => {
    render(
      <TextInput error="Repository is invalid" hint="Paste a GitHub URL" label="Repository" />,
    );

    const input = screen.getByLabelText('Repository');

    expect(screen.getByText('Paste a GitHub URL')).toBeInTheDocument();
    expect(screen.getByText('Repository is invalid')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Paste a GitHub URL Repository is invalid');
  });

  test('merges external description ids with hint and error ids', () => {
    render(
      <>
        <p id="external-description">External description</p>
        <TextInput
          aria-describedby="external-description"
          error="Repository is invalid"
          hint="Paste a GitHub URL"
          label="Repository"
        />
      </>,
    );

    expect(screen.getByLabelText('Repository')).toHaveAccessibleDescription(
      'External description Paste a GitHub URL Repository is invalid',
    );
  });

  test('forwards ref to input element', () => {
    const ref = createRef<HTMLInputElement>();

    render(<TextInput label="Repository" ref={ref} />);

    expect(ref.current).toBe(screen.getByLabelText('Repository'));
  });

  test('renders left icon', () => {
    render(<TextInput label="Repository" leftIcon={<Search aria-hidden="true" />} />);

    expect(
      screen.getByLabelText('Repository').parentElement?.querySelector('svg'),
    ).toBeInTheDocument();
  });

  test('renders clear button when value is present', () => {
    const onClear = vi.fn();

    render(
      <TextInput
        clearButtonLabel="Clear repository"
        label="Repository"
        onClear={onClear}
        value="owner/repo"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear repository' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test('does not render clear button for empty value', () => {
    render(
      <TextInput
        clearButtonLabel="Clear repository"
        label="Repository"
        onClear={vi.fn()}
        value=""
      />,
    );

    expect(screen.queryByRole('button', { name: 'Clear repository' })).not.toBeInTheDocument();
  });
});
