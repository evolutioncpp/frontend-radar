export const githubOwnerPattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
export const githubRepositoryPattern = /^[a-z\d._-]+$/i;
export const githubBranchPattern = /^[^\s~^:?*\[\]\\\x00-\x1f\x7f]+(?:\/[^\s~^:?*\[\]\\\x00-\x1f\x7f]+)*$/u;

const packageJsonPathPattern = /\/package\.json$/i;

const removeTrailingSlashes = (value) => {
  return value.replace(/\/+$/, '');
};

const removeGitSuffix = (value) => {
  return value.endsWith('.git') ? value.slice(0, -4) : value;
};

const getRawUrlPathParts = (value) => {
  const rawPathname = value.replace(/^https?:\/\/[^/?#]+/i, '').split(/[?#]/u)[0] ?? '';

  return rawPathname.split('/').filter(Boolean);
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

export const normalizeGithubBranchName = (value) => {
  const normalizedValue = removeTrailingSlashes(value.trim().replace(/\\/g, '/'));

  if (!normalizedValue || normalizedValue.startsWith('/') || normalizedValue.endsWith('.lock')) {
    return null;
  }

  const branchParts = normalizedValue.split('/');

  if (
    !githubBranchPattern.test(normalizedValue) ||
    normalizedValue.includes('..') ||
    branchParts.some((part) => !part || part === '.' || part === '..' || part.endsWith('.'))
  ) {
    return null;
  }

  return branchParts.join('/');
};

export const isGithubBranchName = (value) => {
  return normalizeGithubBranchName(value) !== null;
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

export const normalizeGithubRepository = (owner, repository, projectPath, branch) => {
  if (!isGithubOwnerName(owner) || !isGithubRepositoryName(repository)) {
    return null;
  }

  const normalizedProjectPath = projectPath ? normalizeGithubProjectPath(projectPath) : null;
  const normalizedBranch = branch ? normalizeGithubBranchName(branch) : null;

  if ((projectPath && !normalizedProjectPath) || (branch && !normalizedBranch)) {
    return null;
  }

  return {
    ...(normalizedBranch ? { branch: normalizedBranch } : {}),
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

export const resolveGithubTreePath = (treePath, branches) => {
  const normalizedTreePath = normalizeGithubProjectPath(treePath);

  if (!normalizedTreePath) {
    return null;
  }

  const normalizedBranches = branches
    .map((branch) => normalizeGithubBranchName(branch))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  const matchedBranch = normalizedBranches.find(
    (branch) => normalizedTreePath === branch || normalizedTreePath.startsWith(`${branch}/`),
  );

  if (!matchedBranch) {
    return null;
  }

  const projectPath = normalizedTreePath.slice(matchedBranch.length).replace(/^\/+/u, '');

  return {
    branch: matchedBranch,
    ...(projectPath ? { projectPath } : {}),
  };
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
    const pathParts = getRawUrlPathParts(valueWithProtocol);
    const hasUnsafePathSegment = pathParts.some((part) => {
      try {
        const decodedPart = decodeURIComponent(part);

        return decodedPart === '.' || decodedPart === '..';
      } catch {
        return true;
      }
    });

    if (!isGithubHost || pathParts.length < 2 || hasUnsafePathSegment) {
      return null;
    }

    const [owner, repository] = pathParts;
    const isTreeUrl = pathParts[2] === 'tree';
    const treePath = isTreeUrl && pathParts.length > 3 ? pathParts.slice(3).join('/') : undefined;

    if (pathParts.length > 2 && (!isTreeUrl || pathParts.length === 3)) {
      return null;
    }

    const parsedRepository = normalizeGithubRepository(owner, removeGitSuffix(repository));

    return parsedRepository && treePath ? { ...parsedRepository, treePath } : parsedRepository;
  } catch {
    return null;
  }
};
