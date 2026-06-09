import { describe, expect, test } from 'vitest';

import {
  getGithubRepositoryKey,
  isGithubOwnerName,
  isGithubRepositoryName,
  normalizeGithubRepository,
  parseGithubRepositoryInput,
} from './index.js';

describe('github repository helpers', () => {
  test.each([
    ['owner/repo', 'owner', 'repo'],
    ['https://github.com/owner/repo', 'owner', 'repo'],
    ['http://github.com/owner/repo', 'owner', 'repo'],
    ['github.com/owner/repo', 'owner', 'repo'],
    ['https://github.com/owner/repo.git', 'owner', 'repo'],
    ['https://github.com/owner/repo?tab=readme', 'owner', 'repo'],
    ['https://github.com/owner/repo#readme', 'owner', 'repo'],
    [' https://github.com/owner/repo/ ', 'owner', 'repo'],
    ['Owner/repo.name-1', 'Owner', 'repo.name-1'],
  ])('parses %s', (value, owner, repository) => {
    expect(parseGithubRepositoryInput(value)).toEqual({
      normalizedUrl: `https://github.com/${owner}/${repository}`,
      owner,
      repository,
      repositoryKey: `${owner.toLowerCase()}/${repository.toLowerCase()}`,
    });
  });

  test.each([
    '',
    'github.com/owner',
    'https://gitlab.com/owner/repo',
    'https://github.com/owner/repo/issues',
    'owner/',
    '/repo',
    '-owner/repo',
    'owner-/repo',
  ])('rejects invalid input %s', (value) => {
    expect(parseGithubRepositoryInput(value)).toBeNull();
  });

  test('normalizes owner and repository names into canonical key', () => {
    expect(isGithubOwnerName('Owner-1')).toBe(true);
    expect(isGithubRepositoryName('repo.name-1')).toBe(true);
    expect(getGithubRepositoryKey('Owner', 'Repo')).toBe('owner/repo');
    expect(normalizeGithubRepository('Owner', 'Repo')).toMatchObject({
      normalizedUrl: 'https://github.com/Owner/Repo',
      repositoryKey: 'owner/repo',
    });
  });
});
