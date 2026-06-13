import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  test('renders dialog through portal when open', () => {
    render(
      <Modal
        closeLabel="Close modal"
        description="Description"
        isOpen
        onClose={vi.fn()}
        title="Title"
      >
        Modal content
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Title' })).toHaveTextContent('Modal content');
    expect(screen.getByRole('dialog', { name: 'Title' })).toHaveAccessibleDescription(
      'Description',
    );
  });

  test('does not render dialog when closed', () => {
    render(
      <Modal closeLabel="Close modal" isOpen={false} onClose={vi.fn()} title="Title">
        Modal content
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('closes on close button, backdrop pointer down and escape', async () => {
    const onClose = vi.fn();
    const { container, rerender } = render(
      <Modal closeLabel="Close modal" isOpen onClose={onClose} title="Title">
        Modal content
      </Modal>,
    );

    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Title' })).getByRole('button', {
        name: 'Close modal',
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button', { name: 'Close modal' })).toHaveLength(1);

    rerender(
      <Modal closeLabel="Close modal" isOpen onClose={onClose} title="Title">
        Modal content
      </Modal>,
    );

    fireEvent.pointerDown(container.ownerDocument.querySelector('[data-modal-backdrop]')!);
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test('restores focus after close', async () => {
    const { rerender } = render(
      <>
        <button type="button">Open modal</button>
        <Modal closeLabel="Close modal" isOpen={false} onClose={vi.fn()} title="Title">
          Modal content
        </Modal>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Open modal' });
    trigger.focus();

    rerender(
      <>
        <button type="button">Open modal</button>
        <Modal closeLabel="Close modal" isOpen onClose={vi.fn()} title="Title">
          Modal content
        </Modal>
      </>,
    );

    await waitFor(() => {
      expect(
        within(screen.getByRole('dialog', { name: 'Title' })).getByRole('button', {
          name: 'Close modal',
        }),
      ).toHaveFocus();
    });

    rerender(
      <>
        <button type="button">Open modal</button>
        <Modal closeLabel="Close modal" isOpen={false} onClose={vi.fn()} title="Title">
          Modal content
        </Modal>
      </>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open modal' })).toHaveFocus();
    });
  });

  test('keeps tab focus inside dialog', async () => {
    const user = userEvent.setup();

    render(
      <Modal closeLabel="Close modal" isOpen onClose={vi.fn()} title="Title">
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Title' });
    const closeButton = within(dialog).getByRole('button', { name: 'Close modal' });
    const firstAction = within(dialog).getByRole('button', { name: 'First action' });
    const secondAction = within(dialog).getByRole('button', { name: 'Second action' });

    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    await user.tab();
    expect(firstAction).toHaveFocus();

    await user.tab();
    expect(secondAction).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(secondAction).toHaveFocus();
  });
});
