import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { Select } from './Select';

describe('Select', () => {
  const options = [
    {
      label: 'main',
      value: 'main',
    },
    {
      label: 'develop',
      value: 'develop',
    },
  ];

  test('renders label, hint and options', () => {
    render(<Select hint="Choose branch" label="Branch" options={options} value="main" />);

    expect(screen.getByRole('combobox', { name: 'Branch' })).toHaveTextContent('main');
    expect(screen.getByText('Choose branch')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Branch' }));

    expect(screen.getByRole('option', { name: 'develop' })).toBeInTheDocument();
  });

  test('calls onChange when selected value changes', () => {
    const handleChange = vi.fn();

    render(<Select label="Branch" onChange={handleChange} options={options} value="main" />);

    fireEvent.click(screen.getByRole('combobox', { name: 'Branch' }));
    fireEvent.click(screen.getByRole('option', { name: 'develop' }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0]?.[0]).toMatchObject({
      target: {
        value: 'develop',
      },
    });
  });

  test('supports keyboard selection', () => {
    const handleChange = vi.fn();

    render(<Select label="Branch" onChange={handleChange} options={options} value="main" />);

    const select = screen.getByRole('combobox', { name: 'Branch' });

    fireEvent.keyDown(select, {
      key: 'ArrowDown',
    });
    fireEvent.keyDown(select, {
      key: 'ArrowDown',
    });
    fireEvent.keyDown(select, {
      key: 'Enter',
    });

    expect(handleChange.mock.calls[0]?.[0]).toMatchObject({
      target: {
        value: 'develop',
      },
    });
  });

  test('filters options by search query', () => {
    render(
      <Select
        emptySearchMessage="No branches found"
        label="Branch"
        options={options}
        searchable
        searchPlaceholder="Search branch"
        value="main"
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Branch' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search branch' }), {
      target: {
        value: 'dev',
      },
    });

    expect(screen.queryByRole('option', { name: 'main' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'develop' })).toBeInTheDocument();
  });

  test('selects filtered option from search input with Enter', () => {
    const handleChange = vi.fn();

    render(
      <Select
        label="Branch"
        onChange={handleChange}
        options={options}
        searchable
        searchPlaceholder="Search branch"
        value="main"
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Branch' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search branch' }), {
      target: {
        value: 'dev',
      },
    });
    fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Search branch' }), {
      key: 'Enter',
    });

    expect(handleChange.mock.calls[0]?.[0]).toMatchObject({
      target: {
        value: 'develop',
      },
    });
  });

  test('renders empty search state', () => {
    render(
      <Select
        emptySearchMessage="No branches found"
        label="Branch"
        options={options}
        searchable
        searchPlaceholder="Search branch"
        value="main"
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Branch' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search branch' }), {
      target: {
        value: 'release',
      },
    });

    expect(screen.getByRole('option', { name: 'No branches found' })).toBeDisabled();
  });

  test('supports disabled state and error text', () => {
    render(
      <Select
        disabled
        error="Branches unavailable"
        label="Branch"
        options={options}
        value="main"
      />,
    );

    expect(screen.getByLabelText('Branch')).toBeDisabled();
    expect(screen.getByText('Branches unavailable')).toBeInTheDocument();
  });
});
