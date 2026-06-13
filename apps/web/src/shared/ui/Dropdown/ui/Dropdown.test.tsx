import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  test('opens with arrow keys and moves focus through menu items', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown ariaLabel="Open menu" trigger={<span>Menu</span>}>
        <button role="menuitem" type="button">
          First item
        </button>
        <button role="menuitem" type="button">
          Second item
        </button>
      </Dropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Open menu' });

    trigger.focus();
    await user.keyboard('{ArrowDown}');

    const firstItem = await screen.findByRole('menuitem', { name: 'First item' });
    const secondItem = screen.getByRole('menuitem', { name: 'Second item' });

    await waitFor(() => {
      expect(firstItem).toHaveFocus();
    });

    await user.keyboard('{ArrowDown}');
    expect(secondItem).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(firstItem).toHaveFocus();

    await user.keyboard('{End}');
    expect(secondItem).toHaveFocus();

    await user.keyboard('{Home}');
    expect(firstItem).toHaveFocus();
  });

  test('returns focus to trigger when closed with escape', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown ariaLabel="Open menu" trigger={<span>Menu</span>}>
        <button role="menuitem" type="button">
          First item
        </button>
      </Dropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Open menu' });

    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });
});
