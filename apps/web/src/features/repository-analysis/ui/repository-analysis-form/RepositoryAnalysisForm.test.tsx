import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { RepositoryAnalysisForm } from './RepositoryAnalysisForm';

const branchApiMocks = vi.hoisted(() => {
  const response = {
    defaultBranch: 'main',
    branches: [
      {
        isDefault: true,
        name: 'main',
      },
      {
        isDefault: false,
        name: 'feature/dashboard',
      },
      {
        isDefault: false,
        name: 'feature/foo',
      },
    ],
    isTruncated: false,
  };

  return {
    loadRepositoryBranches: vi.fn(() => ({
      unwrap: () => Promise.resolve(response),
    })),
    response,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'form.branchDefault': 'default',
        'form.branchHint': 'Choose the GitHub branch to analyze.',
        'form.branchLabel': 'Branch',
        'form.branchLoadFailedHint':
          'Branch list is unavailable. You can run analysis without selecting a branch; Frontend Radar will use the repository default branch if GitHub access is available.',
        'form.branchLoadFailedOption': 'Could not load branches',
        'form.branchLoading': 'Loading branches...',
        'form.branchPlaceholder': 'Select branch',
        'form.branchSearchEmpty': 'No branches found',
        'form.branchSearchPlaceholder': 'Search branch',
        'form.branchUnavailablePlaceholder': 'Branches unavailable',
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
        'form.errors.invalidBranch': 'Select a valid GitHub branch.',
        'form.errors.branchLoadFailed': 'Could not load repository branches.',
        'form.errors.invalidProjectPath': 'Enter a valid repo-relative folder path.',
        'form.errors.repositoryNotFound':
          'Repository was not found on GitHub, or the configured token does not have access to a private repository.',
        'form.errors.repositoryForbidden':
          'This repository is private, or the configured GitHub token does not have access.',
        'form.errors.serviceUnavailable':
          'Frontend Radar API is unavailable. Check that the backend and database are running, then try again.',
      };

      return translations[key] ?? key;
    },
  }),
}));

vi.mock('../../model/reportAnalysisApi', () => ({
  useLazyListRepositoryBranchesQuery: () => [
    branchApiMocks.loadRepositoryBranches,
    {
      data: branchApiMocks.response,
    },
  ],
}));

const fillRepository = (value: string) => {
  fireEvent.change(screen.getByLabelText('Repository'), {
    target: {
      value,
    },
  });
};

describe('RepositoryAnalysisForm', () => {
  beforeEach(() => {
    branchApiMocks.loadRepositoryBranches.mockReset();
    branchApiMocks.loadRepositoryBranches.mockImplementation(() => ({
      unwrap: () => Promise.resolve(branchApiMocks.response),
    }));
  });

  const waitForDefaultBranch = async () => {
    fireEvent.click(screen.getByLabelText('Branch'));

    await waitFor(() => {
      expect(screen.getByLabelText('Branch')).toHaveValue('main');
    });
  };

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
    await waitForDefaultBranch();
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        branch: 'main',
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        repository: 'repo',
      });
    });
  });

  test('does not load branches while repository input is being typed', () => {
    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    fillRepository('facebook/react');

    expect(screen.getByLabelText('Branch')).toBeInTheDocument();
    expect(branchApiMocks.loadRepositoryBranches).not.toHaveBeenCalled();
  });

  test('loads branches when branch select is opened', async () => {
    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    fillRepository('facebook/react');
    fireEvent.click(screen.getByLabelText('Branch'));

    await waitFor(() => {
      expect(branchApiMocks.loadRepositoryBranches).toHaveBeenCalledWith(
        {
          owner: 'facebook',
          repository: 'react',
        },
        true,
      );
      expect(screen.getByLabelText('Branch')).toHaveValue('main');
    });

    fireEvent.click(screen.getByLabelText('Branch'));

    expect(branchApiMocks.loadRepositoryBranches).toHaveBeenCalledTimes(1);
  });

  test('submits normalized owner/repo value', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('owner/repo');
    await waitForDefaultBranch();
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        branch: 'main',
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
    await waitForDefaultBranch();

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Specify frontend path' })).toBeChecked();
      expect(screen.getByLabelText('Branch')).toHaveValue('main');
      expect(screen.getByLabelText('Frontend path')).toHaveValue('apps/web');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        branch: 'main',
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        projectPath: 'apps/web',
        projectPathSource: 'url',
        repository: 'repo',
      });
    });
  });

  test('resolves tree URL before submit without opening branch select', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('https://github.com/owner/repo/tree/feature/foo/apps/web');
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(branchApiMocks.loadRepositoryBranches).toHaveBeenCalledWith(
        {
          owner: 'owner',
          repository: 'repo',
        },
        true,
      );
      expect(onSubmit).toHaveBeenCalledWith({
        branch: 'feature/foo',
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
    await waitForDefaultBranch();

    await waitFor(() => {
      expect(screen.getByLabelText('Frontend path')).toHaveValue('apps/web');
    });
    fireEvent.change(screen.getByLabelText('Frontend path'), {
      target: {
        value: 'packages/site',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        branch: 'main',
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
    await waitForDefaultBranch();

    await waitFor(() => {
      expect(screen.getByLabelText('Frontend path')).toHaveValue('apps/web');
    });
    fillRepository('https://github.com/owner/repo');

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Specify frontend path' })).not.toBeChecked();
      expect(screen.queryByLabelText('Frontend path')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Branch')).toHaveValue('main');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        branch: 'main',
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
    await waitForDefaultBranch();

    await waitFor(() => {
      expect(screen.getByLabelText('Frontend path')).toHaveValue('apps/web');
    });
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
        branch: 'main',
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
    await waitForDefaultBranch();

    await waitFor(() => {
      expect(screen.getByLabelText('Frontend path')).toHaveValue('apps/web');
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Specify frontend path' }));

    expect(screen.queryByLabelText('Frontend path')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        branch: 'main',
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

  test('resolves tree URL with slash branch using loaded branches', async () => {
    const onSubmit = vi.fn();

    render(<RepositoryAnalysisForm onSubmit={onSubmit} />);

    fillRepository('https://github.com/owner/repo/tree/feature/foo/apps/web');
    fireEvent.click(screen.getByLabelText('Branch'));

    await waitFor(() => {
      expect(screen.getByLabelText('Branch')).toHaveValue('feature/foo');
      expect(screen.getByLabelText('Frontend path')).toHaveValue('apps/web');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        branch: 'feature/foo',
        normalizedUrl: 'https://github.com/owner/repo',
        owner: 'owner',
        projectPath: 'apps/web',
        projectPathSource: 'url',
        repository: 'repo',
      });
    });
  });

  test('shows unavailable branch state when branch loading fails', async () => {
    const repositoryNotFoundError = Object.assign(new Error('Repository not found'), {
      data: {
        code: 'repository_not_found',
      },
    });

    branchApiMocks.loadRepositoryBranches.mockReturnValueOnce({
      unwrap: () => Promise.reject(repositoryNotFoundError),
    });

    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    fillRepository('https://github.com/owner/repo/tree/main/apps/web');
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(
      await screen.findByText(
        'Repository was not found on GitHub, or the configured token does not have access to a private repository.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Branches unavailable')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Branch'));

    expect(screen.getByText('Could not load branches')).toBeInTheDocument();
  });

  test('shows access message when branch loading is forbidden', async () => {
    const repositoryForbiddenError = Object.assign(new Error('Repository forbidden'), {
      data: {
        code: 'repository_forbidden',
      },
    });

    branchApiMocks.loadRepositoryBranches.mockReturnValueOnce({
      unwrap: () => Promise.reject(repositoryForbiddenError),
    });

    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    fillRepository('owner/private-repo');
    fireEvent.click(screen.getByLabelText('Branch'));

    expect(
      await screen.findByText(
        'This repository is private, or the configured GitHub token does not have access.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Branch list is unavailable. You can run analysis without selecting a branch; Frontend Radar will use the repository default branch if GitHub access is available.',
      ),
    ).toBeInTheDocument();
  });

  test('shows service unavailable message when branch loading cannot reach the API', async () => {
    branchApiMocks.loadRepositoryBranches.mockReturnValueOnce({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('API unavailable'), {
            status: 'FETCH_ERROR',
          }),
        ),
    });

    render(<RepositoryAnalysisForm onSubmit={vi.fn()} />);

    fillRepository('owner/repo');
    fireEvent.click(screen.getByLabelText('Branch'));

    expect(
      await screen.findByText(
        'Frontend Radar API is unavailable. Check that the backend and database are running, then try again.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Branches unavailable')).toBeInTheDocument();
  });
});
