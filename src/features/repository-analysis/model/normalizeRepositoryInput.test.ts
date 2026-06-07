import { describe, expect, test } from 'vitest';

import { normalizeRepositoryInput } from './normalizeRepositoryInput';

describe('normalizeRepositoryInput', () => {
  test.each([
    ['owner/repo', 'owner/repo'],
    ['https://github.com/owner/repo', 'owner/repo'],
    ['http://github.com/owner/repo', 'owner/repo'],
    ['github.com/owner/repo', 'owner/repo'],
    ['https://github.com/owner/repo.git', 'owner/repo'],
    ['https://github.com/owner/repo?tab=readme', 'owner/repo'],
    ['https://github.com/owner/repo#readme', 'owner/repo'],
    [' https://github.com/owner/repo/ ', 'owner/repo'],
  ])('normalizes %s', (value, repository) => {
    expect(normalizeRepositoryInput(value)).toEqual({
      repository,
      normalizedUrl: `https://github.com/${repository}`,
    });
  });

  test.each([
    '',
    'github.com/owner',
    'https://gitlab.com/owner/repo',
    'https://github.com/owner/repo/issues',
    'owner/',
    '/repo',
  ])('returns null for invalid value %s', (value) => {
    expect(normalizeRepositoryInput(value)).toBeNull();
  });
});
