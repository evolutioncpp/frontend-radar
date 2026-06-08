import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Dropdown } from './Dropdown';

describe('Dropdown', () => {
  test('opens dropdown content on trigger click', () => {
    render(
      <Dropdown ariaLabel="Open menu" trigger={<span>Menu</span>}>
        <button role="menuitem" type="button">
          First item
        </button>
      </Dropdown>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'First item' })).toBeInTheDocument();
  });

  test('closes dropdown on escape', async () => {
    render(
      <Dropdown ariaLabel="Open menu" trigger={<span>Menu</span>}>
        <button role="menuitem" type="button">
          First item
        </button>
      </Dropdown>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  test('closes dropdown when render prop close is called', async () => {
    render(
      <Dropdown ariaLabel="Open menu" trigger={<span>Menu</span>}>
        {({ close }) => (
          <button onClick={close} role="menuitem" type="button">
            Close menu
          </button>
        )}
      </Dropdown>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Close menu' }));

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  test('sets expanded state on trigger', () => {
    render(
      <Dropdown ariaLabel="Open menu" trigger={<span>Menu</span>}>
        <button role="menuitem" type="button">
          First item
        </button>
      </Dropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Open menu' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
