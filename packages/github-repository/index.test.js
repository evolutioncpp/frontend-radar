import { describe, expect, test } from 'vitest';

import {
  getGithubRepositoryKey,
  isGithubBranchName,
  isGithubOwnerName,
  isGithubProjectPath,
  isGithubRepositoryName,
  normalizeGithubBranchName,
  normalizeGithubProjectPath,
  normalizeGithubRepository,
  parseGithubRepositoryInput,
  resolveGithubTreePath,
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
    ['owner/repo/apps/web', 'owner', 'repo', 'apps/web'],
    ['Owner/repo.name-1/frontend', 'Owner', 'repo.name-1', 'frontend'],
  ])('parses %s with project path', (value, owner, repository, projectPath) => {
    expect(parseGithubRepositoryInput(value)).toEqual({
      normalizedUrl: `https://github.com/${owner}/${repository}`,
      owner,
      projectPath,
      repository,
      repositoryKey: `${owner.toLowerCase()}/${repository.toLowerCase()}`,
    });
  });

  test.each([
    ['https://github.com/owner/repo/tree/main', 'main'],
    ['https://github.com/owner/repo/tree/main/apps/web', 'main/apps/web'],
    ['https://github.com/owner/repo/tree/main/apps/web/package.json', 'main/apps/web/package.json'],
    ['https://github.com/owner/repo/tree/feature/foo/apps/web', 'feature/foo/apps/web'],
  ])('parses %s with tree path', (value, treePath) => {
    expect(parseGithubRepositoryInput(value)).toEqual({
      normalizedUrl: 'https://github.com/owner/repo',
      owner: 'owner',
      repository: 'repo',
      repositoryKey: 'owner/repo',
      treePath,
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
    'owner/repo/../web',
    'owner/repo/apps//web',
    'owner/repo//apps/web',
    'https://github.com/owner/repo/issues',
    'https://github.com/owner/repo/tree',
    'https://github.com/owner/repo/tree/main/../apps',
  ])('rejects invalid input %s', (value) => {
    expect(parseGithubRepositoryInput(value)).toBeNull();
  });

  test.each([
    ['apps/web', 'apps/web'],
    [' apps/web/ ', 'apps/web'],
    ['apps/web/package.json', 'apps/web'],
    ['apps\\web', 'apps/web'],
  ])('normalizes project path %s', (value, expectedPath) => {
    expect(isGithubProjectPath(value)).toBe(true);
    expect(normalizeGithubProjectPath(value)).toBe(expectedPath);
  });

  test.each(['', '/apps/web', 'C:/apps/web', 'apps//web', 'apps/../web', './web'])(
    'rejects invalid project path %s',
    (value) => {
      expect(isGithubProjectPath(value)).toBe(false);
      expect(normalizeGithubProjectPath(value)).toBeNull();
    },
  );

  test.each([
    ['main', 'main'],
    ['feature/foo', 'feature/foo'],
    [' release/v1/ ', 'release/v1'],
  ])('normalizes branch %s', (value, expectedBranch) => {
    expect(isGithubBranchName(value)).toBe(true);
    expect(normalizeGithubBranchName(value)).toBe(expectedBranch);
  });

  test.each(['', '/main', 'main..next', 'feature//foo', 'feature/foo.lock', 'feature/foo.', 'bad:ref'])(
    'rejects invalid branch %s',
    (value) => {
      expect(isGithubBranchName(value)).toBe(false);
      expect(normalizeGithubBranchName(value)).toBeNull();
    },
  );

  test('resolves tree path with the longest matching branch prefix', () => {
    expect(resolveGithubTreePath('feature/foo/apps/web', ['main', 'feature/foo'])).toEqual({
      branch: 'feature/foo',
      projectPath: 'apps/web',
    });
  });

  test('resolves tree path without project path', () => {
    expect(resolveGithubTreePath('main', ['main'])).toEqual({
      branch: 'main',
    });
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
