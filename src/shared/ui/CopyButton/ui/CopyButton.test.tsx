import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { CopyButton } from './CopyButton';

describe('CopyButton', () => {
  test('renders copy button with accessible label', () => {
    render(<CopyButton ariaLabel="Copy link" value="https://example.com" />);

    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
  });

  test('copies provided string value', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    render(<CopyButton ariaLabel="Copy link" value="https://example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('https://example.com');
    });
  });

  test('copies value returned from function', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    render(<CopyButton ariaLabel="Copy link" value={() => 'dynamic value'} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('dynamic value');
    });
  });

  test('calls onCopied when copy succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopied = vi.fn();

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    render(<CopyButton ariaLabel="Copy link" onCopied={onCopied} value="copied value" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    await waitFor(() => {
      expect(onCopied).toHaveBeenCalledWith('copied value');
    });
  });

  test('calls onCopyError when copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Copy failed'));
    const onCopyError = vi.fn();

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    render(<CopyButton ariaLabel="Copy link" onCopyError={onCopyError} value="copied value" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    await waitFor(() => {
      expect(onCopyError).toHaveBeenCalledWith('copied value');
    });
  });

  test('uses copied title after successful copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    render(
      <CopyButton
        ariaLabel="Copy link"
        copiedTitle="Copied"
        title="Copy section link"
        value="copied value"
      />,
    );

    const button = screen.getByRole('button', { name: 'Copy link' });

    expect(button).toHaveAttribute('title', 'Copy section link');

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('title', 'Copied');
    });
  });
});
