import {
  normalizeGithubBranchName,
  normalizeGithubProjectPath,
} from '@frontend-radar/github-repository';
import { z } from 'zod';

import { parseRepositoryInput } from './parseRepositoryInput';

export const createRepositoryAnalysisFormSchema = (
  invalidRepositoryMessage: string,
  invalidProjectPathMessage: string,
  invalidBranchMessage: string,
) => {
  return z
    .object({
      branch: z.string(),
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
        const normalizedBranch = values.branch ? normalizeGithubBranchName(values.branch) : null;

        if (values.branch && !normalizedBranch) {
          ctx.addIssue({
            code: 'custom',
            message: invalidBranchMessage,
            path: ['branch'],
          });

          return z.NEVER;
        }

        return {
          ...(normalizedBranch ? { branch: normalizedBranch } : {}),
          normalizedUrl: parsedRepository.normalizedUrl,
          owner: parsedRepository.owner,
          repository: parsedRepository.repository,
        };
      }

      const normalizedProjectPath = normalizeGithubProjectPath(values.projectPath);
      const normalizedBranch = values.branch ? normalizeGithubBranchName(values.branch) : null;

      if (values.branch && !normalizedBranch) {
        ctx.addIssue({
          code: 'custom',
          message: invalidBranchMessage,
          path: ['branch'],
        });

        return z.NEVER;
      }

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
        ...(normalizedBranch ? { branch: normalizedBranch } : {}),
        normalizedUrl: parsedRepository.normalizedUrl,
        owner: parsedRepository.owner,
        projectPath: normalizedProjectPath,
        projectPathSource,
        repository: parsedRepository.repository,
      };
    });
};

export type RepositoryAnalysisFormValues = z.input<
  ReturnType<typeof createRepositoryAnalysisFormSchema>
>;

export type RepositoryAnalysisFormSubmitResult = z.output<
  ReturnType<typeof createRepositoryAnalysisFormSchema>
>;
