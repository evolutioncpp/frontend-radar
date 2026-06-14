import { describe, expect, it } from 'vitest';

import {
  buildDependencyHealth,
  getPackageManagerFromLockfile,
} from './reportDependencyAnalyzer.js';

import type { PackageJson } from '../../application/ports/reportRepositoryReader.js';

describe('reportDependencyAnalyzer', () => {
  it('detects package manager from supported lockfiles', () => {
    expect(getPackageManagerFromLockfile('package-lock.json')).toBe('npm');
    expect(getPackageManagerFromLockfile('pnpm-lock.yaml')).toBe('pnpm');
    expect(getPackageManagerFromLockfile('yarn.lock')).toBe('yarn');
    expect(getPackageManagerFromLockfile('bun.lockb')).toBe('bun');
  });

  it('marks clean package metadata and lockfile as healthy', () => {
    const packageJson: PackageJson = {
      devDependencies: {
        eslint: '^9.0.0',
        typescript: '^6.0.0',
      },
      packageManager: 'pnpm@10.0.0',
    };

    expect(
      buildDependencyHealth({
        lockfiles: [
          {
            packageManager: 'pnpm',
            path: 'pnpm-lock.yaml',
            scope: 'project',
          },
        ],
        packageJson,
        packageJsonPath: 'package.json',
        rootPackageJson: packageJson,
      }),
    ).toMatchObject({
      declaredPackageManager: 'pnpm',
      hasMixedLockfiles: false,
      misplacedDevDependencies: [],
      packageManagerMismatch: false,
      primaryPackageManager: 'pnpm',
    });
  });

  it('detects mixed lockfiles and package manager mismatch', () => {
    expect(
      buildDependencyHealth({
        lockfiles: [
          {
            packageManager: 'npm',
            path: 'package-lock.json',
            scope: 'project',
          },
          {
            packageManager: 'pnpm',
            path: 'pnpm-lock.yaml',
            scope: 'project',
          },
        ],
        packageJson: {
          packageManager: 'pnpm@10.0.0',
        },
        packageJsonPath: 'package.json',
        rootPackageJson: null,
      }),
    ).toMatchObject({
      declaredPackageManager: 'pnpm',
      hasMixedLockfiles: true,
      packageManagerMismatch: true,
      primaryPackageManager: 'npm',
    });
  });

  it('detects dev-only tooling in production dependencies', () => {
    const health = buildDependencyHealth({
      lockfiles: [],
      packageJson: {
        dependencies: {
          '@types/react': '^19.0.0',
          eslint: '^9.0.0',
          react: '^19.0.0',
        },
      },
      packageJsonPath: 'apps/web/package.json',
      rootPackageJson: null,
    });

    expect(health.misplacedDevDependencies).toEqual(['@types/react', 'eslint']);
    expect(health.misplacedDevDependencySources).toEqual([
      'apps/web/package.json dependencies.@types/react',
      'apps/web/package.json dependencies.eslint',
    ]);
  });
});
