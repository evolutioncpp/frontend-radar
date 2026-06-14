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

  test('calls onValueChange when selected value changes', () => {
    const handleValueChange = vi.fn();

    render(
      <Select label="Branch" onValueChange={handleValueChange} options={options} value="main" />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Branch' }));
    fireEvent.click(screen.getByRole('option', { name: 'develop' }));

    expect(handleValueChange).toHaveBeenCalledTimes(1);
    expect(handleValueChange).toHaveBeenCalledWith('develop');
  });

  test('supports keyboard selection', () => {
    const handleValueChange = vi.fn();

    render(
      <Select label="Branch" onValueChange={handleValueChange} options={options} value="main" />,
    );

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

    expect(handleValueChange).toHaveBeenCalledWith('develop');
  });

  test('scrolls active option into view during keyboard navigation', () => {
    const scrollIntoView = vi.fn();

    render(<Select label="Branch" options={options} value="main" />);

    const select = screen.getByRole('combobox', { name: 'Branch' });

    fireEvent.keyDown(select, {
      key: 'ArrowDown',
    });
    Object.defineProperty(screen.getByRole('option', { name: 'develop' }), 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    fireEvent.keyDown(select, {
      key: 'ArrowDown',
    });

    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'nearest',
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
    const handleValueChange = vi.fn();

    render(
      <Select
        label="Branch"
        onValueChange={handleValueChange}
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

    expect(handleValueChange).toHaveBeenCalledWith('develop');
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

    expect(screen.getByRole('option', { name: 'No branches found' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('does not select empty state option', () => {
    const handleValueChange = vi.fn();

    render(
      <Select
        emptySearchMessage="No branches found"
        label="Branch"
        onValueChange={handleValueChange}
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
    fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Search branch' }), {
      key: 'Enter',
    });

    expect(handleValueChange).not.toHaveBeenCalled();
  });

  test('does not select disabled options', () => {
    const handleValueChange = vi.fn();

    render(
      <Select
        label="Branch"
        onValueChange={handleValueChange}
        options={[
          ...options,
          {
            disabled: true,
            label: 'release',
            value: 'release',
          },
        ]}
        value="main"
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Branch' }));
    fireEvent.click(screen.getByRole('option', { name: 'release' }));

    expect(handleValueChange).not.toHaveBeenCalled();
  });

  test('closes listbox on tab without selecting an option', () => {
    const handleValueChange = vi.fn();

    render(
      <Select label="Branch" onValueChange={handleValueChange} options={options} value="main" />,
    );

    const select = screen.getByRole('combobox', { name: 'Branch' });

    fireEvent.keyDown(select, {
      key: 'ArrowDown',
    });

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(select, {
      key: 'Tab',
    });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(handleValueChange).not.toHaveBeenCalled();
  });

  test('links combobox to listbox only while open', () => {
    render(<Select id="branch-select" label="Branch" options={options} value="main" />);

    const select = screen.getByRole('combobox', { name: 'Branch' });

    expect(select).not.toHaveAttribute('aria-controls');

    fireEvent.click(select);

    expect(select).toHaveAttribute('aria-controls', 'branch-select-listbox');
    expect(screen.getByRole('listbox')).toHaveAttribute('id', 'branch-select-listbox');
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
