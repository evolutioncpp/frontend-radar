import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { RepositoryAnalysisForm } from './RepositoryAnalysisForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'form.label': 'Repository',
        'form.placeholder': 'https://github.com/owner/repo',
        'form.hint': 'Paste a GitHub repository URL or owner/repo.',
        'form.clear': 'Clear repository',
        'form.submit': 'Analyze',
        'form.errors.invalidRepository': 'Enter a valid GitHub repository.',
      };

      return translations[key] ?? key;
    },
  }),
}));

const fillRepository = (value: string) => {
  fireEvent.change(screen.getByLabelText('Repository'), {
    target: {
      value,
    },
  });
};

describe('RepositoryAnalysisForm', () => {
  test('renders repository input and submit button', () => {
    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Repository')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
  });

  test('shows validation error for empty value', async () => {
    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(await screen.findByText('Enter a valid GitHub repository.')).toBeInTheDocument();
  });

  test('shows validation error for non-GitHub URL', async () => {
    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    fillRepository('https://gitlab.com/owner/repo');
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(await screen.findByText('Enter a valid GitHub repository.')).toBeInTheDocument();
  });

  test('submits normalized GitHub URL', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('http://github.com/owner/repo');
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        repository: 'owner/repo',
        normalizedUrl: 'https://github.com/owner/repo',
      });
    });
  });

  test('submits normalized owner/repo value', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('owner/repo');
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        repository: 'owner/repo',
        normalizedUrl: 'https://github.com/owner/repo',
      });
    });
  });

  test('clears repository value', () => {
    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    fillRepository('owner/repo');
    fireEvent.click(screen.getByRole('button', { name: 'Clear repository' }));

    expect(screen.getByLabelText('Repository')).toHaveValue('');
  });
});
