import { describe, expect, it } from 'vitest';

import { scanProjectSourceFiles } from './reportSourceScanner.js';

import type { ReportRepositoryReader } from '../../application/ports/reportRepositoryReader.js';

describe('scanProjectSourceFiles', () => {
  it('scans bounded source files and ignores generated/build paths', async () => {
    const reader = {
      listDirectoryEntries: async (
        _owner: string,
        _repository: string,
        _branch: string,
        path: string,
      ) => {
        if (path === 'apps/web') {
          return [
            { name: 'src', path: 'apps/web/src', type: 'dir' },
            { name: 'dist', path: 'apps/web/dist', type: 'dir' },
            { name: 'generatedApi.ts', path: 'apps/web/generatedApi.ts', type: 'file' },
            { name: 'vite.config.ts', path: 'apps/web/vite.config.ts', type: 'file' },
          ];
        }

        if (path === 'apps/web/src') {
          return [
            { name: 'main.tsx', path: 'apps/web/src/main.tsx', type: 'file' },
            { name: 'types.d.ts', path: 'apps/web/src/types.d.ts', type: 'file' },
          ];
        }

        return [];
      },
      readTextFile: async (_owner: string, _repository: string, _branch: string, path: string) => {
        return `// ${path}`;
      },
    } as unknown as ReportRepositoryReader;

    const scan = await scanProjectSourceFiles({
      branch: 'main',
      owner: 'owner',
      projectPath: 'apps/web',
      reader,
      repository: 'repo',
    });

    expect(scan).toMatchObject({
      isTruncated: false,
      sources: ['apps/web/vite.config.ts', 'apps/web/src/main.tsx'],
    });
    expect(scan.files.map((file) => file.path)).toEqual([
      'apps/web/vite.config.ts',
      'apps/web/src/main.tsx',
    ]);
    expect(scan.files.map((file) => file.kind)).toEqual(['config', 'source']);
  });
});
