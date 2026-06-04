import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  test('renders tooltip content on hover', () => {
    render(
      <Tooltip content="Tooltip content" side="right">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip content');
  });

  test('hides tooltip content on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip content" side="right">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByRole('button', { name: 'Trigger' }));

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  test('renders tooltip content on focus', () => {
    render(
      <Tooltip content="Tooltip content" side="right">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.focus(screen.getByRole('button', { name: 'Trigger' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip content');
  });

  test('does not render tooltip when disabled', () => {
    render(
      <Tooltip content="Tooltip content" disabled side="right">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('closes tooltip on escape', async () => {
    render(
      <Tooltip content="Tooltip content" side="right">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});
