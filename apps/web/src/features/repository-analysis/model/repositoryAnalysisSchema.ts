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
      projectPathSource: z.union([z.enum(['url', 'manual']), z.literal('')]).optional(),
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

      const projectPathSource =
        values.projectPathSource === 'url' ? ('url' as const) : ('manual' as const);

      return {
        ...parsedRepository,
        projectPath: normalizedProjectPath,
        projectPathSource,
      };
    });
};

export type RepositoryAnalysisFormValues = z.input<
  ReturnType<typeof createRepositoryAnalysisFormSchema>
>;

export type RepositoryAnalysisFormSubmitResult = z.output<
  ReturnType<typeof createRepositoryAnalysisFormSchema>
>;
