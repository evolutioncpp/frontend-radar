import { isGithubRepositoryNotFoundError } from './githubErrors.js';

import type { GithubClient } from './githubClient.js';

export interface GithubRepositoryMetadata {
  defaultBranch: string;
  description: string | null;
  forks: number;
  htmlUrl: string;
  license: string | null;
  name: string;
  owner: string;
  pushedAt: string | null;
  stars: number;
}

export interface RepositorySnapshot {
  latestCommitDate: string | null;
  latestCommitSha: string | null;
}

export type PackageJson = {
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  optionalDependencies?: Record<string, unknown>;
  peerDependencies?: Record<string, unknown>;
  scripts?: Record<string, unknown>;
};

export type TextFileMatch = {
  content: string;
  path: string;
};

const getObjectField = (value: unknown, field: string) => {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  return (value as Record<string, unknown>)[field];
};

const getStringField = (value: unknown, field: string) => {
  const fieldValue = getObjectField(value, field);

  return typeof fieldValue === 'string' ? fieldValue : null;
};

const getNumberField = (value: unknown, field: string) => {
  const fieldValue = getObjectField(value, field);

  return typeof fieldValue === 'number' ? fieldValue : 0;
};

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toPackageJson = (value: unknown): PackageJson | null => {
  if (!isRecord(value)) {
    return null;
  }

  const scripts = getObjectField(value, 'scripts');
  const dependencies = getObjectField(value, 'dependencies');
  const devDependencies = getObjectField(value, 'devDependencies');
  const optionalDependencies = getObjectField(value, 'optionalDependencies');
  const peerDependencies = getObjectField(value, 'peerDependencies');

  return {
    dependencies: isRecord(dependencies) ? dependencies : undefined,
    devDependencies: isRecord(devDependencies) ? devDependencies : undefined,
    optionalDependencies: isRecord(optionalDependencies) ? optionalDependencies : undefined,
    peerDependencies: isRecord(peerDependencies) ? peerDependencies : undefined,
    scripts: isRecord(scripts) ? scripts : undefined,
  };
};

export class GithubRepositoryReader {
  constructor(private readonly client: GithubClient) {}

  async getRepositorySnapshot(owner: string, repository: string) {
    const repositoryMetadata = await this.fetchRepositoryMetadata(owner, repository);
    const latestCommit = await this.fetchLatestCommit(
      owner,
      repository,
      repositoryMetadata.defaultBranch,
    );

    return {
      latestCommitDate: latestCommit?.date ?? repositoryMetadata.pushedAt,
      latestCommitSha: latestCommit?.sha ?? null,
    } satisfies RepositorySnapshot;
  }

  async fetchRepositoryMetadata(owner: string, repository: string) {
    const body = await this.client.requestJson(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`,
    );
    const ownerBody = getObjectField(body, 'owner');
    const licenseBody = getObjectField(body, 'license');

    return {
      defaultBranch: getStringField(body, 'default_branch') ?? 'main',
      description: getStringField(body, 'description'),
      forks: getNumberField(body, 'forks_count'),
      htmlUrl: getStringField(body, 'html_url') ?? `https://github.com/${owner}/${repository}`,
      license: getStringField(licenseBody, 'spdx_id') ?? getStringField(licenseBody, 'name'),
      name: getStringField(body, 'name') ?? repository,
      owner: getStringField(ownerBody, 'login') ?? owner,
      pushedAt: getStringField(body, 'pushed_at'),
      stars: getNumberField(body, 'stargazers_count'),
    } satisfies GithubRepositoryMetadata;
  }

  async fetchLatestCommit(owner: string, repository: string, branch: string) {
    try {
      const body = await this.client.requestJson(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commits/${encodeURIComponent(branch)}`,
      );
      const commit = getObjectField(body, 'commit');
      const author = getObjectField(commit, 'author');
      const sha = getStringField(body, 'sha');
      const date = getStringField(author, 'date');

      if (!sha && !date) {
        return null;
      }

      return {
        date,
        sha,
      };
    } catch (error) {
      if (isGithubRepositoryNotFoundError(error)) {
        return null;
      }

      throw error;
    }
  }

  async readPackageJson(owner: string, repository: string, branch: string) {
    const content = await this.readFile(owner, repository, branch, 'package.json');

    if (!content) {
      return null;
    }

    try {
      return toPackageJson(JSON.parse(content));
    } catch {
      return null;
    }
  }

  async findFirstPath(owner: string, repository: string, branch: string, paths: readonly string[]) {
    for (const path of paths) {
      if (await this.hasPath(owner, repository, branch, path)) {
        return path;
      }
    }

    return null;
  }

  async readFirstTextFile(
    owner: string,
    repository: string,
    branch: string,
    paths: readonly string[],
  ): Promise<TextFileMatch | null> {
    for (const path of paths) {
      const content = await this.readFile(owner, repository, branch, path);

      if (content !== null) {
        return {
          content,
          path,
        };
      }
    }

    return null;
  }

  async listDirectoryFiles(owner: string, repository: string, branch: string, path: string) {
    const body = await this.requestContents(owner, repository, branch, path);

    if (!Array.isArray(body)) {
      return [];
    }

    return body
      .map((entry) => {
        if (!isRecord(entry)) {
          return null;
        }

        const type = getStringField(entry, 'type');
        const name = getStringField(entry, 'name');

        if (type !== 'file' || !name) {
          return null;
        }

        return name;
      })
      .filter((name): name is string => name !== null);
  }

  async hasAnyPath(owner: string, repository: string, branch: string, paths: readonly string[]) {
    return (await this.findFirstPath(owner, repository, branch, paths)) !== null;
  }

  async hasDirectory(owner: string, repository: string, branch: string, path: string) {
    return (await this.listDirectoryFiles(owner, repository, branch, path)).length > 0;
  }

  private async hasPath(owner: string, repository: string, branch: string, path: string) {
    return (await this.requestContents(owner, repository, branch, path)) !== null;
  }

  private async readFile(owner: string, repository: string, branch: string, path: string) {
    const body = await this.requestContents(owner, repository, branch, path);

    if (!isRecord(body)) {
      return null;
    }

    const content = getStringField(body, 'content');
    const encoding = getStringField(body, 'encoding');

    if (!content || encoding !== 'base64') {
      return null;
    }

    return Buffer.from(content, 'base64').toString('utf8');
  }

  private async requestContents(owner: string, repository: string, branch: string, path: string) {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');

    return this.client.requestJson(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
      {
        allowNotFound: true,
      },
    );
  }
}
