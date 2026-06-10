import { parseGithubRepositoryInput } from '@frontend-radar/github-repository';

import type { RepositoryAnalysisRequest } from './repositoryAnalysisTypes';

export const parseRepositoryInput = (value: string): RepositoryAnalysisRequest | null => {
  const parsedRepository = parseGithubRepositoryInput(value);

  return parsedRepository
    ? {
        normalizedUrl: parsedRepository.normalizedUrl,
        owner: parsedRepository.owner,
        ...(parsedRepository.projectPath ? { projectPath: parsedRepository.projectPath } : {}),
        repository: parsedRepository.repository,
      }
    : null;
};
