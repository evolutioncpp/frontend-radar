const githubRepositoryPattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\/[a-z\d._-]+$/i;

const removeTrailingSlashes = (value: string) => {
  return value.replace(/\/+$/, '');
};

const removeGitSuffix = (value: string) => {
  return value.endsWith('.git') ? value.slice(0, -4) : value;
};

export const normalizeRepositoryInput = (value: string) => {
  const trimmedValue = removeGitSuffix(removeTrailingSlashes(value.trim()));

  if (!trimmedValue) {
    return null;
  }

  if (githubRepositoryPattern.test(trimmedValue)) {
    return {
      repository: trimmedValue,
      normalizedUrl: `https://github.com/${trimmedValue}`,
    };
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

    const repository = removeGitSuffix(pathParts.join('/'));

    if (!githubRepositoryPattern.test(repository)) {
      return null;
    }

    return {
      repository,
      normalizedUrl: `https://github.com/${repository}`,
    };
  } catch {
    return null;
  }
};
