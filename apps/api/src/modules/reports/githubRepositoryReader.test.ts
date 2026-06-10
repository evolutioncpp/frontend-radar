import { describe, expect, it } from 'vitest';

import { GithubRepositoryReader } from './githubRepositoryReader.js';

import type { GithubClient } from './githubClient.js';

const encodeContent = (content: string) => Buffer.from(content, 'utf8').toString('base64');

const createReader = () => {
  const requestedPaths: string[] = [];
  const client = {
    requestJson: async (path: string) => {
      requestedPaths.push(path);

      if (path.includes('/contents/README.md?')) {
        return null;
      }

      if (path.includes('/contents/docs/README.md?')) {
        return {};
      }

      if (path.includes('/contents/package.json?')) {
        return {
          content: encodeContent('{"scripts":{"test":"vitest run"}}'),
          encoding: 'base64',
        };
      }

      if (path.includes('/contents/apps/web/package.json?')) {
        return {
          content: encodeContent('{"name":"@scope/web","scripts":{"build":"vite build"}}'),
          encoding: 'base64',
        };
      }

      if (path.includes('/contents/apps?')) {
        return [
          {
            name: 'web',
            path: 'apps/web',
            type: 'dir',
          },
          {
            name: 'README.md',
            path: 'apps/README.md',
            type: 'file',
          },
        ];
      }

      if (path.includes('/contents/.github/workflows?')) {
        return [
          {
            name: 'ci.yml',
            type: 'file',
          },
          {
            name: 'archive',
            type: 'dir',
          },
        ];
      }

      return null;
    },
  } satisfies Pick<GithubClient, 'requestJson'>;

  return {
    reader: new GithubRepositoryReader(client as GithubClient),
    requestedPaths,
  };
};

describe('GithubRepositoryReader', () => {
  it('returns latest commit snapshot with title from first commit message line', async () => {
    const client = {
      requestJson: async (path: string) => {
        if (path === '/repos/owner/repo') {
          return {
            default_branch: 'main',
            pushed_at: '2026-06-08T00:00:00.000Z',
          };
        }

        if (path === '/repos/owner/repo/commits/main') {
          return {
            sha: 'abc123',
            commit: {
              author: {
                date: '2026-06-09T00:00:00.000Z',
              },
              message: 'Add frontend dashboard\n\nDetailed body.',
            },
          };
        }

        return null;
      },
    } satisfies Pick<GithubClient, 'requestJson'>;
    const reader = new GithubRepositoryReader(client as GithubClient);

    await expect(reader.getRepositorySnapshot('owner', 'repo')).resolves.toEqual({
      defaultBranch: 'main',
      latestCommitDate: '2026-06-09T00:00:00.000Z',
      latestCommitSha: 'abc123',
      latestCommitTitle: 'Add frontend dashboard',
    });
  });

  it('returns the first existing path from path candidates', async () => {
    const { reader } = createReader();

    await expect(
      reader.findFirstPath('owner', 'repo', 'main', ['README.md', 'docs/README.md']),
    ).resolves.toBe('docs/README.md');
  });

  it('returns the first readable text file from path candidates', async () => {
    const { reader } = createReader();

    await expect(
      reader.readFirstTextFile('owner', 'repo', 'main', ['README.md', 'package.json']),
    ).resolves.toEqual({
      content: '{"scripts":{"test":"vitest run"}}',
      path: 'package.json',
    });
  });

  it('lists only file names from directory contents', async () => {
    const { reader } = createReader();

    await expect(
      reader.listDirectoryFiles('owner', 'repo', 'main', '.github/workflows'),
    ).resolves.toEqual(['ci.yml']);
  });

  it('reads package.json from a nested project path', async () => {
    const { reader } = createReader();

    await expect(reader.readPackageJson('owner', 'repo', 'main', 'apps/web')).resolves.toEqual(
      expect.objectContaining({
        name: '@scope/web',
        scripts: {
          build: 'vite build',
        },
      }),
    );
  });

  it('lists directory entries with file and dir types', async () => {
    const { reader } = createReader();

    await expect(reader.listDirectoryEntries('owner', 'repo', 'main', 'apps')).resolves.toEqual([
      {
        name: 'web',
        path: 'apps/web',
        type: 'dir',
      },
      {
        name: 'README.md',
        path: 'apps/README.md',
        type: 'file',
      },
    ]);
  });
});
