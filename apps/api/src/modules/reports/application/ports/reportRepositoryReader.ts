export interface ReportRepositoryReaderContext {
  githubToken?: string;
}

export interface ReportRepositoryMetadata {
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
  branch: string;
  defaultBranch?: string;
  latestCommitDate: string | null;
  latestCommitSha: string | null;
  latestCommitTitle: string | null;
}

export interface RepositoryBranches {
  branches: Array<{
    isDefault: boolean;
    name: string;
  }>;
  defaultBranch: string;
  isTruncated: boolean;
}

export type PackageJson = {
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  name?: string;
  optionalDependencies?: Record<string, unknown>;
  packageManager?: string;
  peerDependencies?: Record<string, unknown>;
  scripts?: Record<string, unknown>;
  workspaces?: string[];
};

export type TextFileMatch = {
  content: string;
  path: string;
};

export type RepositoryDirectoryEntry = {
  name: string;
  path: string;
  type: 'dir' | 'file';
};

export interface ReportRepositoryReader {
  fetchLatestCommit(
    owner: string,
    repository: string,
    branch: string,
    options?: { throwOnNotFound?: boolean },
    context?: ReportRepositoryReaderContext,
  ): Promise<{
    date: string | null;
    sha: string | null;
    title: string | null;
  } | null>;
  fetchRepositoryMetadata(
    owner: string,
    repository: string,
    context?: ReportRepositoryReaderContext,
  ): Promise<ReportRepositoryMetadata>;
  findExistingPaths(
    owner: string,
    repository: string,
    branch: string,
    paths: readonly string[],
    context?: ReportRepositoryReaderContext,
  ): Promise<string[]>;
  findFirstPath(
    owner: string,
    repository: string,
    branch: string,
    paths: readonly string[],
    context?: ReportRepositoryReaderContext,
  ): Promise<string | null>;
  getRepositorySnapshot(
    owner: string,
    repository: string,
    branch?: string | null,
    context?: ReportRepositoryReaderContext,
  ): Promise<RepositorySnapshot>;
  hasAnyPath(
    owner: string,
    repository: string,
    branch: string,
    paths: readonly string[],
    context?: ReportRepositoryReaderContext,
  ): Promise<boolean>;
  hasDirectory(
    owner: string,
    repository: string,
    branch: string,
    path: string,
    context?: ReportRepositoryReaderContext,
  ): Promise<boolean>;
  listBranches(
    owner: string,
    repository: string,
    limit?: number,
    context?: ReportRepositoryReaderContext,
  ): Promise<RepositoryBranches>;
  listDirectoryEntries(
    owner: string,
    repository: string,
    branch: string,
    path: string,
    context?: ReportRepositoryReaderContext,
  ): Promise<RepositoryDirectoryEntry[]>;
  listDirectoryFiles(
    owner: string,
    repository: string,
    branch: string,
    path: string,
    context?: ReportRepositoryReaderContext,
  ): Promise<string[]>;
  readFirstTextFile(
    owner: string,
    repository: string,
    branch: string,
    paths: readonly string[],
    context?: ReportRepositoryReaderContext,
  ): Promise<TextFileMatch | null>;
  readPackageJson(
    owner: string,
    repository: string,
    branch: string,
    basePath?: string,
    context?: ReportRepositoryReaderContext,
  ): Promise<PackageJson | null>;
  readTextFile(
    owner: string,
    repository: string,
    branch: string,
    path: string,
    context?: ReportRepositoryReaderContext,
  ): Promise<string | null>;
  validateToken(context?: ReportRepositoryReaderContext): Promise<void>;
}
