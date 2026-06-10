import { describe, expect, test } from 'vitest';

import { createRepositoryAnalysisFormSchema } from './repositoryAnalysisSchema';

const schema = createRepositoryAnalysisFormSchema(
  'Invalid repository',
  'Invalid project path',
  'Invalid branch',
);

describe('repositoryAnalysisFormSchema', () => {
  test('transforms repository input into analysis request', () => {
    expect(
      schema.parse({
        branch: 'develop',
        projectPath: '',
        repository: 'https://github.com/owner/repo.git',
        useProjectPath: false,
      }),
    ).toEqual({
      branch: 'develop',
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      repository: 'repo',
    });
  });

  test('returns configured validation message for invalid repository', () => {
    const result = schema.safeParse({
      repository: 'https://gitlab.com/owner/repo',
      branch: '',
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
        branch: 'feature/dashboard',
        projectPath: 'apps/web/package.json',
        projectPathSource: 'manual',
        repository: 'https://github.com/owner/repo/tree/main/packages/site',
        useProjectPath: true,
      }),
    ).toEqual({
      branch: 'feature/dashboard',
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      projectPath: 'apps/web',
      projectPathSource: 'manual',
      repository: 'repo',
    });
  });

  test('returns configured validation message for invalid project path', () => {
    const result = schema.safeParse({
      projectPath: '../web',
      branch: '',
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

  test('returns configured validation message for invalid branch', () => {
    const result = schema.safeParse({
      branch: 'feature..bad',
      projectPath: '',
      repository: 'https://github.com/owner/repo',
      useProjectPath: false,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues).toEqual([
        expect.objectContaining({
          message: 'Invalid branch',
          path: ['branch'],
        }),
      ]);
    }
  });
});
