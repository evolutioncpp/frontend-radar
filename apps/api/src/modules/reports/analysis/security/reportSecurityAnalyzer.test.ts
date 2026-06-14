import { describe, expect, it } from 'vitest';

import { analyzeSecurity } from './reportSecurityAnalyzer.js';

import type { ReportRepositoryReader } from '../../application/ports/reportRepositoryReader.js';
import type { SourceFileSignal } from '../../domain/reportSignalContracts.js';

const createReader = () =>
  ({
    listDirectoryEntries: async (
      _owner: string,
      _repository: string,
      _branch: string,
      path: string,
    ) => {
      if (path === 'apps/web') {
        return [
          { name: '.env', path: 'apps/web/.env', type: 'file' },
          { name: '.npmrc', path: 'apps/web/.npmrc', type: 'file' },
          { name: 'private.pem', path: 'apps/web/private.pem', type: 'file' },
        ];
      }

      if (path === '') {
        return [{ name: '.env.local', path: '.env.local', type: 'file' }];
      }

      return [];
    },
    readTextFile: async (_owner: string, _repository: string, _branch: string, path: string) => {
      if (path === 'apps/web/.gitignore') {
        return ['.env*', '.npmrc', '*.pem', '*.key'].join('\n');
      }

      return null;
    },
  }) as unknown as ReportRepositoryReader;

describe('analyzeSecurity', () => {
  it('detects sensitive files without exposing values', async () => {
    const security = await analyzeSecurity({
      branch: 'main',
      envExample: {
        exists: true,
        path: 'apps/web/.env.example',
        scope: 'project',
      },
      files: [],
      owner: 'owner',
      projectPath: 'apps/web',
      reader: createReader(),
      repository: 'repo',
    });

    expect(security.sensitiveFiles).toMatchObject({
      found: true,
      sources: ['apps/web/.env', 'apps/web/.npmrc', 'apps/web/private.pem', '.env.local'],
    });
    expect(security.sensitiveFiles.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'env', path: 'apps/web/.env' }),
        expect.objectContaining({ kind: 'npmrc', path: 'apps/web/.npmrc' }),
        expect.objectContaining({ kind: 'private_key', path: 'apps/web/private.pem' }),
      ]),
    );
  });

  it('detects high-confidence secret patterns and ignores test placeholders', async () => {
    const fakeGithubPat = `github_pat_${'123456789012345678901234567890abcdef'}`;
    const fakeClassicToken = `ghp_${'123456789012345678901234567890123456'}`;
    const files: SourceFileSignal[] = [
      {
        content: `export const token = '${fakeGithubPat}';`,
        kind: 'source',
        path: 'apps/web/src/config.ts',
      },
      {
        content: "const apiKey = 'example-placeholder-token';",
        kind: 'source',
        path: 'apps/web/src/example.ts',
      },
      {
        content: `const token = '${fakeClassicToken}';`,
        kind: 'test',
        path: 'apps/web/src/config.test.ts',
      },
      {
        content: 'const token = process.env.GITHUB_TOKEN;',
        kind: 'source',
        path: 'apps/web/src/env.ts',
      },
    ];
    const security = await analyzeSecurity({
      branch: 'main',
      envExample: {
        exists: false,
        path: null,
      },
      files,
      owner: 'owner',
      projectPath: 'apps/web',
      reader: {
        listDirectoryEntries: async () => [],
        readTextFile: async () => null,
      } as unknown as ReportRepositoryReader,
      repository: 'repo',
    });

    expect(security.hardcodedSecrets).toMatchObject({
      found: true,
      count: 1,
      matches: [
        {
          kind: 'github_token',
          path: 'apps/web/src/config.ts',
        },
      ],
      sources: ['apps/web/src/config.ts'],
    });
    expect(security.envUsage).toMatchObject({
      found: true,
      sources: ['apps/web/src/env.ts'],
      withoutExample: true,
    });
  });

  it('detects a real generic secret even when an earlier assignment is a placeholder', async () => {
    const files: SourceFileSignal[] = [
      {
        content: [
          "const apiKey = 'example-placeholder-token';",
          "const clientSecret = 'real-client-secret-1234567890';",
        ].join('\n'),
        kind: 'source',
        path: 'apps/web/src/config.ts',
      },
    ];
    const security = await analyzeSecurity({
      branch: 'main',
      envExample: {
        exists: true,
        path: 'apps/web/.env.example',
      },
      files,
      owner: 'owner',
      projectPath: 'apps/web',
      reader: {
        listDirectoryEntries: async () => [],
        readTextFile: async () => null,
      } as unknown as ReportRepositoryReader,
      repository: 'repo',
    });

    expect(security.hardcodedSecrets).toMatchObject({
      found: true,
      count: 1,
      matches: [
        {
          kind: 'generic_secret',
          path: 'apps/web/src/config.ts',
        },
      ],
    });
  });

  it('reads gitignore coverage for env, npmrc and private key files', async () => {
    const security = await analyzeSecurity({
      branch: 'main',
      envExample: {
        exists: false,
        path: null,
      },
      files: [],
      owner: 'owner',
      projectPath: 'apps/web',
      reader: createReader(),
      repository: 'repo',
    });

    expect(security.gitignore).toMatchObject({
      coversEnvFiles: true,
      coversNpmrc: true,
      coversPrivateKeys: true,
      exists: true,
      path: 'apps/web/.gitignore',
      scope: 'project',
    });
  });

  it('treats an empty gitignore as present but incomplete', async () => {
    const security = await analyzeSecurity({
      branch: 'main',
      envExample: {
        exists: false,
        path: null,
      },
      files: [],
      owner: 'owner',
      projectPath: 'apps/web',
      reader: {
        listDirectoryEntries: async () => [],
        readTextFile: async (_owner: string, _repository: string, _branch: string, path: string) =>
          path === 'apps/web/.gitignore' ? '' : null,
      } as unknown as ReportRepositoryReader,
      repository: 'repo',
    });

    expect(security.gitignore).toMatchObject({
      coversEnvFiles: false,
      coversNpmrc: false,
      coversPrivateKeys: false,
      exists: true,
      path: 'apps/web/.gitignore',
      scope: 'project',
    });
  });
});
