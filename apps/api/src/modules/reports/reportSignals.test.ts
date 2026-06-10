import { describe, expect, it } from 'vitest';

import { collectRepositorySignals } from './reportSignals.js';

import type { GithubRepositoryReader, PackageJson } from './githubRepositoryReader.js';

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
      listDirectoryFiles: async () => ['ci.yml', 'deploy.yml'],
      readFirstTextFile: async () => ({
        content: createSubstantialReadme(),
        path: 'README.md',
      }),
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'abc123',
      owner: 'owner',
      packageJson,
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
      sources: ['vite'],
    });
    expect(signals.storybook).toMatchObject({
      dependencies: ['@storybook/react-vite'],
      found: true,
      sources: ['@storybook/react-vite'],
    });
  });

  it('detects Bun from the current bun.lock file name', async () => {
    const reader = {
      findFirstPath: async (
        _owner: string,
        _repository: string,
        _branch: string,
        paths: readonly string[],
      ) => (paths.includes('bun.lock') ? 'bun.lock' : null),
      listDirectoryFiles: async () => [],
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
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
      listDirectoryFiles: async () => [],
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson,
      reader,
      repository: 'repo',
    });

    expect(signals.a11yTooling).toMatchObject({
      dependencies: ['@axe-core/react'],
      found: true,
      sources: ['@axe-core/react'],
    });
    expect(signals.bundler).toMatchObject({
      dependencies: ['next'],
      found: true,
      sources: ['next'],
    });
  });

  it('keeps CI source compact for repositories with many workflow files', async () => {
    const reader = {
      findFirstPath: async () => null,
      listDirectoryFiles: async () => ['ci.yml', 'deploy.yml', 'lint.yml', 'release.yml'],
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
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

  it('ignores disabled and non-YAML files in GitHub Actions workflows directory', async () => {
    const reader = {
      findFirstPath: async () => null,
      listDirectoryFiles: async () => ['ci.yml.disabled', 'README.md', 'deploy.yaml', 'lint.yml'],
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
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
      listDirectoryFiles: async () => ['ci.yml.disabled', 'README.md'],
      readFirstTextFile: async () => null,
    } as unknown as GithubRepositoryReader;

    const signals = await collectRepositorySignals({
      branch: 'main',
      owner: 'owner',
      packageJson: null,
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
