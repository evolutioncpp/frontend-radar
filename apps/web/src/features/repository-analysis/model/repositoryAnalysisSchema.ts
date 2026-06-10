import { normalizeGithubProjectPath } from '@frontend-radar/github-repository';
import { z } from 'zod';

import { parseRepositoryInput } from './parseRepositoryInput';

export const createRepositoryAnalysisFormSchema = (
  invalidRepositoryMessage: string,
  invalidProjectPathMessage: string,
) => {
  return z
    .object({
      projectPath: z.string(),
      repository: z.string(),
      useProjectPath: z.boolean(),
    })
    .transform((values, ctx) => {
      const parsedRepository = parseRepositoryInput(values.repository);

      if (!parsedRepository) {
        ctx.addIssue({
          code: 'custom',
          message: invalidRepositoryMessage,
          path: ['repository'],
        });

        return z.NEVER;
      }

      if (!values.useProjectPath) {
        return {
          normalizedUrl: parsedRepository.normalizedUrl,
          owner: parsedRepository.owner,
          repository: parsedRepository.repository,
        };
      }

      const normalizedProjectPath = normalizeGithubProjectPath(values.projectPath);

      if (!normalizedProjectPath) {
        ctx.addIssue({
          code: 'custom',
          message: invalidProjectPathMessage,
          path: ['projectPath'],
        });

        return z.NEVER;
      }

      return {
        ...parsedRepository,
        projectPath: normalizedProjectPath,
      };
    });
};

export type RepositoryAnalysisFormValues = z.input<
  ReturnType<typeof createRepositoryAnalysisFormSchema>
>;

export type RepositoryAnalysisFormSubmitResult = z.output<
  ReturnType<typeof createRepositoryAnalysisFormSchema>
>;
