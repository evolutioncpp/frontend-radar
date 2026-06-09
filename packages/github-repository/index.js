export const githubOwnerPattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
export const githubRepositoryPattern = /^[a-z\d._-]+$/i;

const removeTrailingSlashes = (value) => {
  return value.replace(/\/+$/, '');
};

const removeGitSuffix = (value) => {
  return value.endsWith('.git') ? value.slice(0, -4) : value;
};

export const isGithubOwnerName = (owner) => {
  return githubOwnerPattern.test(owner);
};

export const isGithubRepositoryName = (repository) => {
  return githubRepositoryPattern.test(repository);
};

export const getGithubRepositoryKey = (owner, repository) => {
  return `${owner.toLowerCase()}/${repository.toLowerCase()}`;
};

export const normalizeGithubRepository = (owner, repository) => {
  if (!isGithubOwnerName(owner) || !isGithubRepositoryName(repository)) {
    return null;
  }

  return {
    normalizedUrl: `https://github.com/${owner}/${repository}`,
    owner,
    repository,
    repositoryKey: getGithubRepositoryKey(owner, repository),
  };
};

export const parseGithubRepositoryInput = (value) => {
  const trimmedValue = removeGitSuffix(removeTrailingSlashes(value.trim()));

  if (!trimmedValue) {
    return null;
  }

  const directPathParts = trimmedValue.split('/');

  if (directPathParts.length === 2) {
    const [owner, repository] = directPathParts;

    return normalizeGithubRepository(owner, repository);
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

    return normalizeGithubRepository(owner, removeGitSuffix(repository));
  } catch {
    return null;
  }
};
