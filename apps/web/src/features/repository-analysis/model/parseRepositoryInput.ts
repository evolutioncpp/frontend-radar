import type { RepositoryAnalysisRequest } from './repositoryAnalysisTypes';

const githubOwnerPattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const githubRepositoryPattern = /^[a-z\d._-]+$/i;

const removeTrailingSlashes = (value: string) => {
  return value.replace(/\/+$/, '');
};

const removeGitSuffix = (value: string) => {
  return value.endsWith('.git') ? value.slice(0, -4) : value;
};

const buildRepositoryRequest = (
  owner: string,
  repository: string,
): RepositoryAnalysisRequest | null => {
  if (!githubOwnerPattern.test(owner) || !githubRepositoryPattern.test(repository)) {
    return null;
  }

  return {
    normalizedUrl: `https://github.com/${owner}/${repository}`,
    owner,
    repository,
  };
};

export const parseRepositoryInput = (value: string): RepositoryAnalysisRequest | null => {
  const trimmedValue = removeGitSuffix(removeTrailingSlashes(value.trim()));

  if (!trimmedValue) {
    return null;
  }

  const directPathParts = trimmedValue.split('/');

  if (directPathParts.length === 2) {
    const [owner, repository] = directPathParts;

    return buildRepositoryRequest(owner, repository);
  }

  const valueWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(valueWithProtocol);
    const isGithubHost = url.hostname.toLowerCase() === 'github.com';
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (!isGithubHost || pathParts.length !== 2) {
      return null;
    }

    const [owner, repository] = pathParts;

    return buildRepositoryRequest(owner, removeGitSuffix(repository));
  } catch {
    return null;
  }
};
