import { describe, expect, test } from 'vitest';

import { createRepositoryAnalysisFormSchema } from './repositoryAnalysisSchema';

const schema = createRepositoryAnalysisFormSchema('Invalid repository');

describe('repositoryAnalysisFormSchema', () => {
  test('transforms repository input into analysis request', () => {
    expect(
      schema.parse({
        repository: 'https://github.com/owner/repo.git',
      }),
    ).toEqual({
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      repository: 'repo',
    });
  });

  test('returns configured validation message for invalid repository', () => {
    const result = schema.safeParse({
      repository: 'https://gitlab.com/owner/repo',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toEqual([
        expect.objectContaining({
          message: 'Invalid repository',
          path: ['repository'],
        }),
      ]);
    }
  });
});
