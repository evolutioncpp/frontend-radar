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
        'form.projectPathToggle': 'Specify frontend path',
        'form.projectPathToggleHint': 'Use this when the frontend app lives inside a monorepo.',
        'form.projectPathLabel': 'Frontend path',
        'form.projectPathPlaceholder': 'apps/web',
        'form.projectPathHint': 'Repo-relative folder that contains the frontend package.json.',
        'form.projectPathClear': 'Clear frontend path',
        'form.clear': 'Clear repository',
        'form.submit': 'Analyze',
        'form.errors.invalidRepository': 'Enter a valid GitHub repository.',
        'form.errors.invalidProjectPath': 'Enter a valid repo-relative folder path.',
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
    expect(screen.getByRole('checkbox', { name: 'Specify frontend path' })).toBeInTheDocument();
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
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        repository: 'repo',
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
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        repository: 'repo',
      });
    });
  });

  test('autofills project path from GitHub tree URL', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('https://github.com/owner/repo/tree/main/apps/web');

    expect(screen.getByRole('checkbox', { name: 'Specify frontend path' })).toBeChecked();
    expect(screen.getByLabelText('Frontend path')).toHaveValue('apps/web');

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        projectPath: 'apps/web',
        projectPathSource: 'url',
        repository: 'repo',
      });
    });
  });

  test('uses manually entered project path over parsed URL path', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('https://github.com/owner/repo/tree/main/apps/web');
    fireEvent.change(screen.getByLabelText('Frontend path'), {
      target: {
        value: 'packages/site',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        projectPath: 'packages/site',
        projectPathSource: 'manual',
        repository: 'repo',
      });
    });
  });

  test('clears autofilled project path when repository input no longer contains a path', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('https://github.com/owner/repo/tree/main/apps/web');
    fillRepository('https://github.com/owner/repo');

    expect(screen.getByRole('checkbox', { name: 'Specify frontend path' })).not.toBeChecked();
    expect(screen.queryByLabelText('Frontend path')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        repository: 'repo',
      });
    });
  });

  test('keeps manually entered project path when repository input changes', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('https://github.com/owner/repo/tree/main/apps/web');
    fireEvent.change(screen.getByLabelText('Frontend path'), {
      target: {
        value: 'packages/site',
      },
    });
    fillRepository('https://github.com/owner/repo');

    expect(screen.getByRole('checkbox', { name: 'Specify frontend path' })).toBeChecked();
    expect(screen.getByLabelText('Frontend path')).toHaveValue('packages/site');

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        projectPath: 'packages/site',
        projectPathSource: 'manual',
        repository: 'repo',
      });
    });
  });

  test('clears project path when checkbox is disabled', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('https://github.com/owner/repo/tree/main/apps/web');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Specify frontend path' }));

    expect(screen.queryByLabelText('Frontend path')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        repository: 'repo',
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
