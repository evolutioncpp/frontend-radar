import { describe, expect, test } from 'vitest';

import { parseRepositoryInput } from './parseRepositoryInput';

describe('parseRepositoryInput', () => {
  test.each([
    ['owner/repo', 'owner', 'repo'],
    ['https://github.com/owner/repo', 'owner', 'repo'],
    ['http://github.com/owner/repo', 'owner', 'repo'],
    ['github.com/owner/repo', 'owner', 'repo'],
    ['https://github.com/owner/repo.git', 'owner', 'repo'],
    ['https://github.com/owner/repo?tab=readme', 'owner', 'repo'],
    ['https://github.com/owner/repo#readme', 'owner', 'repo'],
    ['https://github.com/owner/repo/tree/main', 'owner', 'repo'],
    [' https://github.com/owner/repo/ ', 'owner', 'repo'],
  ])('parses %s', (value, owner, repository) => {
    expect(parseRepositoryInput(value)).toEqual({
      normalizedUrl: `https://github.com/${owner}/${repository}`,
      owner,
      repository,
    });
  });

  test.each([
    ['owner/repo/apps/web', 'owner', 'repo', 'apps/web'],
    ['https://github.com/owner/repo/tree/main/apps/web', 'owner', 'repo', 'apps/web'],
  ])('parses %s with project path', (value, owner, repository, projectPath) => {
    expect(parseRepositoryInput(value)).toEqual({
      normalizedUrl: `https://github.com/${owner}/${repository}`,
      owner,
      projectPath,
      repository,
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
    expect(parseRepositoryInput(value)).toBeNull();
  });
});
