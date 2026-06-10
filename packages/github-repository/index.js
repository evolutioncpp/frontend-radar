export const githubOwnerPattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
export const githubRepositoryPattern = /^[a-z\d._-]+$/i;

const packageJsonPathPattern = /\/package\.json$/i;

const removeTrailingSlashes = (value) => {
  return value.replace(/\/+$/, '');
};

const removeGitSuffix = (value) => {
  return value.endsWith('.git') ? value.slice(0, -4) : value;
};

const isAbsolutePath = (value) => {
  return value.startsWith('/') || /^[a-z]:\//i.test(value);
};

export const normalizeGithubProjectPath = (value) => {
  const normalizedValue = removeTrailingSlashes(
    value.trim().replace(/\\/g, '/').replace(packageJsonPathPattern, ''),
  );

  if (!normalizedValue || isAbsolutePath(normalizedValue)) {
    return null;
  }

  const pathParts = normalizedValue.split('/');

  if (pathParts.some((part) => !part || part === '.' || part === '..')) {
    return null;
  }

  return pathParts.join('/');
};

export const isGithubProjectPath = (value) => {
  return normalizeGithubProjectPath(value) !== null;
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

export const normalizeGithubRepository = (owner, repository, projectPath) => {
  if (!isGithubOwnerName(owner) || !isGithubRepositoryName(repository)) {
    return null;
  }

  const normalizedProjectPath = projectPath ? normalizeGithubProjectPath(projectPath) : null;

  if (projectPath && !normalizedProjectPath) {
    return null;
  }

  return {
    normalizedUrl: `https://github.com/${owner}/${repository}`,
    owner,
    ...(normalizedProjectPath ? { projectPath: normalizedProjectPath } : {}),
    repository,
    repositoryKey: getGithubRepositoryKey(owner, repository),
  };
};

const parseDirectRepositoryPath = (value) => {
  const directPathParts = value.split('/');

  if (directPathParts.length < 2) {
    return null;
  }

  const [owner, repository, ...projectPathParts] = directPathParts;

  return normalizeGithubRepository(
    owner,
    removeGitSuffix(repository),
    projectPathParts.length > 0 ? projectPathParts.join('/') : undefined,
  );
};

export const parseGithubRepositoryInput = (value) => {
  const trimmedValue = removeGitSuffix(removeTrailingSlashes(value.trim()));

  if (!trimmedValue) {
    return null;
  }

  const directRepository = parseDirectRepositoryPath(trimmedValue);

  if (directRepository) {
    return directRepository;
  }

  const valueWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(valueWithProtocol);
    const isGithubHost = url.hostname.toLowerCase() === 'github.com';
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (!isGithubHost || pathParts.length < 2) {
      return null;
    }

    const [owner, repository] = pathParts;
    const projectPath =
      pathParts[2] === 'tree' && pathParts.length > 4 ? pathParts.slice(4).join('/') : undefined;

    if (pathParts.length > 2 && !projectPath) {
      return null;
    }

    return normalizeGithubRepository(owner, removeGitSuffix(repository), projectPath);
  } catch {
    return null;
  }
};
