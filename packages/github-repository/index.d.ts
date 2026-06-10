export interface GithubRepositoryReference {
  branch?: string;
  normalizedUrl: string;
  owner: string;
  projectPath?: string;
  repository: string;
  repositoryKey: string;
  treePath?: string;
}

export interface GithubTreePathResolution {
  branch: string;
  projectPath?: string;
}

export declare const githubBranchPattern: RegExp;
export declare const githubOwnerPattern: RegExp;
export declare const githubRepositoryPattern: RegExp;

export declare const isGithubBranchName: (value: string) => boolean;
export declare const isGithubOwnerName: (owner: string) => boolean;
export declare const isGithubRepositoryName: (repository: string) => boolean;
export declare const isGithubProjectPath: (value: string) => boolean;
export declare const getGithubRepositoryKey: (owner: string, repository: string) => string;
export declare const normalizeGithubBranchName: (value: string) => string | null;
export declare const normalizeGithubProjectPath: (value: string) => string | null;
export declare const normalizeGithubRepository: (
  owner: string,
  repository: string,
  projectPath?: string,
  branch?: string,
) => GithubRepositoryReference | null;
export declare const resolveGithubTreePath: (
  treePath: string,
  branches: string[],
) => GithubTreePathResolution | null;
export declare const parseGithubRepositoryInput: (
  value: string,
) => GithubRepositoryReference | null;
