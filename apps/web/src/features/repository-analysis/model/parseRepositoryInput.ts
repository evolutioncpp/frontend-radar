import { parseGithubRepositoryInput } from '@frontend-radar/github-repository';

import type { ParsedRepositoryInput } from './repositoryAnalysisTypes';

export const parseRepositoryInput = (value: string): ParsedRepositoryInput | null => {
  const parsedRepository = parseGithubRepositoryInput(value);

  return parsedRepository
    ? {
        ...(parsedRepository.branch ? { branch: parsedRepository.branch } : {}),
        normalizedUrl: parsedRepository.normalizedUrl,
        owner: parsedRepository.owner,
        ...(parsedRepository.projectPath
          ? { projectPath: parsedRepository.projectPath, projectPathSource: 'url' as const }
          : {}),
        repository: parsedRepository.repository,
        ...(parsedRepository.treePath ? { treePath: parsedRepository.treePath } : {}),
      }
    : null;
};
