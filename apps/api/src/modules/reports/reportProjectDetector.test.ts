import { describe, expect, it } from 'vitest';

import {
  ReportProjectPathNotFoundError,
  detectReportProject,
  resolveReportProject,
} from './reportProjectDetector.js';

import type { GithubRepositoryReader, PackageJson } from './githubRepositoryReader.js';

describe('detectReportProject', () => {
  it('selects a frontend workspace over a root workspace orchestrator package', async () => {
    const packageJsonByPath = new Map<string, PackageJson | null>([
      [
        '',
        {
          scripts: {
            build: 'npm run build:web',
            test: 'npm run test:web',
          },
          workspaces: ['apps/*'],
        },
      ],
      [
        'apps/api',
        {
          dependencies: {
            fastify: '^5.0.0',
          },
          name: '@scope/api',
        },
      ],
      [
        'apps/web',
        {
          dependencies: {
            react: '^19.0.0',
          },
          devDependencies: {
            vite: '^8.0.0',
          },
          name: '@scope/web',
          scripts: {
            build: 'vite build',
            test: 'vitest run',
          },
        },
      ],
    ]);
    const reader = {
      listDirectoryEntries: async () => [
        {
          name: 'api',
          path: 'apps/api',
          type: 'dir',
        },
        {
          name: 'web',
          path: 'apps/web',
          type: 'dir',
        },
      ],
      readPackageJson: async (
        _owner: string,
        _repository: string,
        _branch: string,
        basePath = '',
      ) => packageJsonByPath.get(basePath) ?? null,
    } as unknown as GithubRepositoryReader;

    await expect(
      detectReportProject({
        branch: 'abc123',
        owner: 'owner',
        reader,
        repository: 'repo',
      }),
    ).resolves.toMatchObject({
      packageJsonPath: 'apps/web/package.json',
      projectPath: 'apps/web',
    });
  });

  it('keeps root package when it is already a frontend app', async () => {
    const rootPackageJson: PackageJson = {
      dependencies: {
        react: '^19.0.0',
      },
      devDependencies: {
        vite: '^8.0.0',
      },
      scripts: {
        build: 'vite build',
      },
    };
    const reader = {
      listDirectoryEntries: async () => [],
      readPackageJson: async (
        _owner: string,
        _repository: string,
        _branch: string,
        basePath = '',
      ) => (basePath === '' ? rootPackageJson : null),
    } as unknown as GithubRepositoryReader;

    await expect(
      detectReportProject({
        branch: 'abc123',
        owner: 'owner',
        reader,
        repository: 'repo',
      }),
    ).resolves.toMatchObject({
      packageJson: rootPackageJson,
      packageJsonPath: 'package.json',
      projectPath: '',
    });
  });

  it('uses an explicit project path when package.json exists there', async () => {
    const packageJson: PackageJson = {
      name: '@scope/web',
    };
    const reader = {
      readPackageJson: async (
        _owner: string,
        _repository: string,
        _branch: string,
        basePath = '',
      ) => (basePath === 'apps/web' ? packageJson : null),
    } as unknown as GithubRepositoryReader;

    await expect(
      resolveReportProject({
        branch: 'abc123',
        owner: 'owner',
        projectPath: 'apps/web',
        reader,
        repository: 'repo',
      }),
    ).resolves.toMatchObject({
      packageJson,
      packageJsonPath: 'apps/web/package.json',
      projectPath: 'apps/web',
    });
  });

  it('rejects an explicit project path without package.json', async () => {
    const reader = {
      readPackageJson: async () => null,
    } as unknown as GithubRepositoryReader;

    await expect(
      resolveReportProject({
        branch: 'abc123',
        owner: 'owner',
        projectPath: 'apps/missing',
        reader,
        repository: 'repo',
      }),
    ).rejects.toBeInstanceOf(ReportProjectPathNotFoundError);
  });
});
