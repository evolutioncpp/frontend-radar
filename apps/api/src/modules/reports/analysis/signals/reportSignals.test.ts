import { describe, expect, it } from 'vitest';

import { collectRepositorySignals } from './reportSignals.js';

import type {
  GithubRepositoryReader,
  PackageJson,
} from '../../infrastructure/github/githubRepositoryReader.js';

const createSubstantialReadme = () => {
  return [
    '# Project',
    '## Installation',
    'Run npm install and configure the environment.',
    '## Usage',
    'Run npm run dev and open the application.',
    'This README includes enough detail for contributors. '.repeat(20),
  ].join('\n');
};

describe('collectRepositorySignals', () => {
  it('collects structured repository signals with sources and package manager details', async () => {
    const packageJson: PackageJson = {
      dependencies: {
        '@testing-library/react': '^16.0.0',
        vite: '^8.0.0',
      },
      devDependencies: {
        '@storybook/react-vite': '^10.0.0',
        eslint: '^9.0.0',
        typescript: '^6.0.0',
      },
      scripts: {
        build: 'vite build',
        lint: 'eslint .',
        test: 'vitest run',
      },
    };
    const reader = {
      findFirstPath: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => {
        if (paths.includes('pnpm-lock.yaml')) {
          return 'pnpm-lock.yaml';
        }

        if (paths.includes('tsconfig.json')) {
          return 'tsconfig.json';
        }

        if (paths.includes('.env.example')) {
          return '.env.example';
        }

        return null;
      },
      findExistingPaths: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => (paths.includes('pnpm-lock.yaml') ? ['pnpm-lock.yaml'] : []),
      listDirectoryFiles: async () => ['ci.yml', 'deploy.yml'],
      readFirstTextFile: async () => ({
        content: createSubstantialReadme(),
        path: 'README.md',
      }),
      readTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'abc123',
      owner: 'owner',
      packageJson,
      packageJsonPath: 'package.json',
      projectPath: '',
      reader,
      repository: 'repo',
    });

    expect(signals.readme).toMatchObject({
      exists: true,
      hasInstallSection: true,
      hasUsageSection: true,
      isSubstantial: true,
      path: 'README.md',
    });
    expect(signals.packageJson.scripts.test).toMatchObject({
      exists: true,
      source: 'package.json scripts.test',
      value: 'vitest run',
    });
    expect(signals.lockfile).toMatchObject({
      exists: true,
      packageManager: 'pnpm',
      path: 'pnpm-lock.yaml',
    });
    expect(signals.ci).toMatchObject({
      exists: true,
      source: '.github/workflows/ci.yml, .github/workflows/deploy.yml',
      workflowNames: ['ci.yml', 'deploy.yml'],
    });
    expect(signals.bundler).toMatchObject({
      dependencies: ['vite'],
      found: true,
      sources: [
        expect.objectContaining({
          kind: 'dependency',
          name: 'vite',
          path: 'package.json',
          raw: 'package.json dependencies.vite',
          section: 'dependencies',
        }),
      ],
    });
    expect(signals.storybook).toMatchObject({
      dependencies: ['@storybook/react-vite'],
      found: true,
      sources: [
        expect.objectContaining({
          kind: 'dependency',
          name: '@storybook/react-vite',
          path: 'package.json',
          raw: 'package.json devDependencies.@storybook/react-vite',
          section: 'devDependencies',
        }),
      ],
    });
  });

  it('collects project-scoped frontend signals from a nested workspace', async () => {
    const packageJson: PackageJson = {
      dependencies: {
        react: '^19.0.0',
      },
      devDependencies: {
        typescript: '^6.0.0',
        vite: '^8.0.0',
        vitest: '^4.0.0',
      },
      scripts: {
        build: 'vite build',
        lint: 'eslint .',
        test: 'vitest run',
      },
    };
    const reader = {
      findFirstPath: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => {
        if (paths.includes('apps/web/tsconfig.json')) {
          return 'apps/web/tsconfig.json';
        }

        if (paths.includes('package-lock.json')) {
          return 'package-lock.json';
        }

        return null;
      },
      findExistingPaths: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => (paths.includes('package-lock.json') ? ['package-lock.json'] : []),
      listDirectoryFiles: async () => ['ci.yml'],
      readTextFile: async () => null,
      readFirstTextFile: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => ({
        content: createSubstantialReadme(),
        path: paths[0],
      }),
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'abc123',
      owner: 'owner',
      packageJson,
      packageJsonPath: 'apps/web/package.json',
      projectPath: 'apps/web',
      reader,
      repository: 'repo',
    });

    expect(signals.packageJson).toMatchObject({
      exists: true,
      path: 'apps/web/package.json',
    });
    expect(signals.packageJson.scripts.build).toMatchObject({
      source: 'apps/web/package.json scripts.build',
    });
    expect(signals.readme.path).toBe('apps/web/README.md');
    expect(signals.typescript).toMatchObject({
      configPaths: ['apps/web/tsconfig.json'],
      found: true,
      sources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'apps/web/tsconfig.json',
        }),
        expect.objectContaining({
          kind: 'dependency',
          name: 'typescript',
          raw: 'apps/web/package.json devDependencies.typescript',
        }),
      ],
    });
    expect(signals.bundler).toMatchObject({
      dependencies: ['vite'],
      found: true,
      sources: [
        expect.objectContaining({
          kind: 'dependency',
          name: 'vite',
          raw: 'apps/web/package.json devDependencies.vite',
        }),
      ],
    });
    expect(signals.testingLibrary).toMatchObject({
      dependencies: ['vitest'],
      found: true,
      sources: [
        expect.objectContaining({
          kind: 'dependency',
          name: 'vitest',
          raw: 'apps/web/package.json devDependencies.vitest',
        }),
      ],
    });
    expect(signals.lockfile).toMatchObject({
      exists: true,
      path: 'package-lock.json',
    });
  });

  it('collects sibling TypeScript configs and scores strictness from app configs', async () => {
    const packageJson: PackageJson = {
      devDependencies: {
        typescript: '^6.0.0',
      },
      scripts: {
        typecheck: 'tsc -b --noEmit',
      },
    };
    const reader = {
      findFirstPath: async () => null,
      findExistingPaths: async () => [],
      listDirectoryEntries: async (
        _owner: string,
        _repository: string,
        _branch: string,
        path: string,
      ) => {
        if (path !== 'apps/web') {
          return [];
        }

        return [
          { name: 'tsconfig.json', path: 'apps/web/tsconfig.json', type: 'file' },
          { name: 'tsconfig.app.json', path: 'apps/web/tsconfig.app.json', type: 'file' },
          { name: 'tsconfig.node.json', path: 'apps/web/tsconfig.node.json', type: 'file' },
          {
            name: 'tsconfig.eslint.json',
            path: 'apps/web/tsconfig.eslint.json',
            type: 'file',
          },
        ];
      },
      listDirectoryFiles: async () => [],
      readFirstTextFile: async () => null,
      readTextFile: async (_owner: string, _repository: string, _branch: string, path: string) => {
        const files: Record<string, string> = {
          'apps/web/tsconfig.json': JSON.stringify({
            files: [],
            references: [
              { path: './tsconfig.app.json' },
              { path: './tsconfig.node.json' },
              { path: './tsconfig.eslint.json' },
            ],
          }),
          'apps/web/tsconfig.app.json': JSON.stringify({
            compilerOptions: {
              strict: true,
            },
          }),
          'apps/web/tsconfig.node.json': JSON.stringify({
            compilerOptions: {
              strict: false,
            },
          }),
          'apps/web/tsconfig.eslint.json': JSON.stringify({
            compilerOptions: {
              allowJs: true,
            },
          }),
        };

        return files[path] ?? null;
      },
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'abc123',
      owner: 'owner',
      packageJson,
      packageJsonPath: 'apps/web/package.json',
      projectPath: 'apps/web',
      reader,
      repository: 'repo',
    });

    expect(signals.typescriptQuality.config).toMatchObject({
      configPaths: [
        'apps/web/tsconfig.json',
        'apps/web/tsconfig.app.json',
        'apps/web/tsconfig.node.json',
        'apps/web/tsconfig.eslint.json',
      ],
      exists: true,
      path: 'apps/web/tsconfig.app.json',
      strict: true,
    });
    expect(signals.typescriptQuality.typecheck).toMatchObject({
      exists: true,
      source: 'apps/web/package.json scripts.typecheck',
    });
  });

  it('uses project and root config files as tooling signals', async () => {
    const packageJson: PackageJson = {
      scripts: {
        build: 'vite build',
      },
    };
    const reader = {
      findFirstPath: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => {
        if (paths.includes('apps/web/vite.config.ts')) {
          return 'apps/web/vite.config.ts';
        }

        if (paths.includes('apps/web/vitest.config.ts')) {
          return 'apps/web/vitest.config.ts';
        }

        if (paths.includes('apps/web/axe.config.ts')) {
          return 'apps/web/axe.config.ts';
        }

        if (paths.includes('eslint.config.js')) {
          return 'eslint.config.js';
        }

        if (paths.includes('prettier.config.js')) {
          return 'prettier.config.js';
        }

        if (paths.includes('next.config.js')) {
          return 'next.config.js';
        }

        return null;
      },
      findExistingPaths: async () => [],
      listDirectoryFiles: async () => [],
      readTextFile: async () => null,
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'abc123',
      owner: 'owner',
      packageJson,
      packageJsonPath: 'apps/web/package.json',
      projectPath: 'apps/web',
      reader,
      repository: 'repo',
    });

    expect(signals.bundler).toMatchObject({
      configPaths: ['apps/web/vite.config.ts'],
      dependencies: [],
      found: true,
      projectSources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'apps/web/vite.config.ts',
        }),
      ],
      sources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'apps/web/vite.config.ts',
        }),
      ],
    });
    expect(signals.testingLibrary).toMatchObject({
      configPaths: ['apps/web/vitest.config.ts'],
      found: true,
      projectSources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'apps/web/vitest.config.ts',
        }),
      ],
    });
    expect(signals.a11yTooling).toMatchObject({
      configPaths: ['apps/web/axe.config.ts'],
      found: true,
      projectSources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'apps/web/axe.config.ts',
        }),
      ],
    });
    expect(signals.linting).toMatchObject({
      configPaths: ['eslint.config.js'],
      found: true,
      rootSources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'eslint.config.js',
        }),
      ],
      sources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'eslint.config.js',
        }),
      ],
    });
    expect(signals.formatting).toMatchObject({
      configPaths: ['prettier.config.js'],
      found: true,
      rootSources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'prettier.config.js',
        }),
      ],
    });
    expect(signals.frameworks).toMatchObject({
      configPaths: ['next.config.js'],
      found: true,
      rootSources: [
        expect.objectContaining({
          kind: 'file',
          raw: 'next.config.js',
        }),
      ],
    });
  });

  it('detects Bun from the current bun.lock file name', async () => {
    const reader = {
      findExistingPaths: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => (paths.includes('bun.lock') ? ['bun.lock'] : []),
      findFirstPath: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => (paths.includes('bun.lock') ? 'bun.lock' : null),
      listDirectoryFiles: async () => [],
      readTextFile: async () => null,
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
      packageJsonPath: null,
      projectPath: '',
      reader,
      repository: 'repo',
    });

    expect(signals.lockfile).toMatchObject({
      exists: true,
      packageManager: 'bun',
      path: 'bun.lock',
    });
  });

  it('collects dependencies from peer and optional dependency sections', async () => {
    const packageJson: PackageJson = {
      optionalDependencies: {
        '@axe-core/react': '^4.0.0',
      },
      peerDependencies: {
        next: '^15.0.0',
      },
    };
    const reader = {
      findFirstPath: async () => null,
      findExistingPaths: async () => [],
      listDirectoryFiles: async () => [],
      readTextFile: async () => null,
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson,
      packageJsonPath: 'package.json',
      projectPath: '',
      reader,
      repository: 'repo',
    });

    expect(signals.a11yTooling).toMatchObject({
      dependencies: ['@axe-core/react'],
      found: true,
      sources: [
        expect.objectContaining({
          kind: 'dependency',
          name: '@axe-core/react',
          raw: 'package.json optionalDependencies.@axe-core/react',
          section: 'optionalDependencies',
        }),
      ],
    });
    expect(signals.bundler).toMatchObject({
      dependencies: ['next'],
      found: true,
      sources: [
        expect.objectContaining({
          kind: 'dependency',
          name: 'next',
          raw: 'package.json peerDependencies.next',
          section: 'peerDependencies',
        }),
      ],
    });
  });

  it('keeps CI source compact for repositories with many workflow files', async () => {
    const reader = {
      findFirstPath: async () => null,
      findExistingPaths: async () => [],
      listDirectoryFiles: async () => ['ci.yml', 'deploy.yml', 'lint.yml', 'release.yml'],
      readTextFile: async () => null,
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
      packageJsonPath: null,
      projectPath: '',
      reader,
      repository: 'repo',
    });

    expect(signals.ci).toMatchObject({
      exists: true,
      source:
        '.github/workflows/ci.yml, .github/workflows/deploy.yml, .github/workflows/lint.yml, +1 more',
      workflowNames: ['ci.yml', 'deploy.yml', 'lint.yml', 'release.yml'],
    });
  });

  it('marks workflow content analysis as truncated when workflow count exceeds limit', async () => {
    const workflowNames = Array.from({ length: 11 }, (_, index) => `ci-${index}.yml`);
    const readPaths: string[] = [];
    const reader = {
      findFirstPath: async () => null,
      findExistingPaths: async () => [],
      listDirectoryFiles: async () => workflowNames,
      readTextFile: async (_owner: string, _repository: string, _branch: string, path: string) => {
        readPaths.push(path);

        return 'on: push';
      },
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
      packageJsonPath: null,
      projectPath: '',
      reader,
      repository: 'repo',
    });

    expect(signals.ciAnalysis).toMatchObject({
      isWorkflowAnalysisTruncated: true,
    });
    expect(signals.ciAnalysis.analyzedWorkflowPaths).toHaveLength(10);
    expect(readPaths.filter((path) => path.startsWith('.github/workflows/'))).toHaveLength(10);
  });

  it('ignores disabled and non-YAML files in GitHub Actions workflows directory', async () => {
    const reader = {
      findFirstPath: async () => null,
      findExistingPaths: async () => [],
      listDirectoryFiles: async () => ['ci.yml.disabled', 'README.md', 'deploy.yaml', 'lint.yml'],
      readTextFile: async () => null,
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
      packageJsonPath: null,
      projectPath: '',
      reader,
      repository: 'repo',
    });

    expect(signals.ci).toMatchObject({
      exists: true,
      source: '.github/workflows/deploy.yaml, .github/workflows/lint.yml',
      workflowNames: ['deploy.yaml', 'lint.yml'],
    });
  });

  it('does not report CI when workflows directory only has disabled files', async () => {
    const reader = {
      findFirstPath: async () => null,
      findExistingPaths: async () => [],
      listDirectoryFiles: async () => ['ci.yml.disabled', 'README.md'],
      readTextFile: async () => null,
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
      packageJsonPath: null,
      projectPath: '',
      reader,
      repository: 'repo',
    });

    expect(signals.ci).toMatchObject({
      exists: false,
      source: null,
      workflowNames: [],
    });
  });
});
