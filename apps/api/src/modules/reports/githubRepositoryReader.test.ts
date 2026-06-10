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
});
