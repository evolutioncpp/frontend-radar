export interface GithubRepositoryReference {
  normalizedUrl: string;
  owner: string;
  repository: string;
  repositoryKey: string;
}

export declare const githubOwnerPattern: RegExp;
export declare const githubRepositoryPattern: RegExp;

export declare const isGithubOwnerName: (owner: string) => boolean;
export declare const isGithubRepositoryName: (repository: string) => boolean;
export declare const getGithubRepositoryKey: (owner: string, repository: string) => string;
export declare const normalizeGithubRepository: (
  owner: string,
  repository: string,
) => GithubRepositoryReference | null;
export declare const parseGithubRepositoryInput: (
  value: string,
) => GithubRepositoryReference | null;
