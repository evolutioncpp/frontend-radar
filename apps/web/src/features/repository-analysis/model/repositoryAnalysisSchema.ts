import { z } from 'zod';

import { parseRepositoryInput } from './parseRepositoryInput';

export const createRepositoryAnalysisFormSchema = (invalidRepositoryMessage: string) => {
  return z
    .object({
      repository: z.string(),
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

      return parsedRepository;
    });
};

export type RepositoryAnalysisFormValues = z.input<
  ReturnType<typeof createRepositoryAnalysisFormSchema>
>;

export type RepositoryAnalysisFormSubmitResult = z.output<
  ReturnType<typeof createRepositoryAnalysisFormSchema>
>;
