import { describe, expect, test } from 'vitest';

import { createRepositoryAnalysisFormSchema } from './repositoryAnalysisSchema';

const schema = createRepositoryAnalysisFormSchema('Invalid repository', 'Invalid project path');

describe('repositoryAnalysisFormSchema', () => {
  test('transforms repository input into analysis request', () => {
    expect(
      schema.parse({
        projectPath: '',
        repository: 'https://github.com/owner/repo.git',
        useProjectPath: false,
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
      projectPath: '',
      useProjectPath: false,
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

  test('uses manual project path when enabled', () => {
    expect(
      schema.parse({
        projectPath: 'apps/web/package.json',
        repository: 'https://github.com/owner/repo/tree/main/packages/site',
        useProjectPath: true,
      }),
    ).toEqual({
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      projectPath: 'apps/web',
      repository: 'repo',
    });
  });

  test('returns configured validation message for invalid project path', () => {
    const result = schema.safeParse({
      projectPath: '../web',
      repository: 'https://github.com/owner/repo',
      useProjectPath: true,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toEqual([
        expect.objectContaining({
          message: 'Invalid project path',
          path: ['projectPath'],
        }),
      ]);
    }
  });
});
