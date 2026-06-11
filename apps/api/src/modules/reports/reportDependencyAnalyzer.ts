import { dependencyAnalysisConfig } from './reportAnalysisConfig.js';

import type { PackageJson } from './githubRepositoryReader.js';
import type { SignalScope } from './reportSignals.js';

type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

export type LockfileSignal = {
  packageManager: string | null;
  path: string;
  scope: SignalScope;
};

export type DependencyHealth = {
  declaredPackageManager: string | null;
  declaredPackageManagerSource: string | null;
  hasMixedLockfiles: boolean;
  lockfiles: LockfileSignal[];
  misplacedDevDependencies: string[];
  misplacedDevDependencySources: string[];
  packageManagerMismatch: boolean;
  primaryPackageManager: string | null;
};

export const getPackageManagerFromLockfile = (lockfilePath: string | null) => {
  const lockfileName = lockfilePath?.split('/').at(-1) ?? null;

  if (!lockfileName) {
    return null;
  }

  return (
    dependencyAnalysisConfig.packageManagerByLockfile[
      lockfileName as keyof typeof dependencyAnalysisConfig.packageManagerByLockfile
    ] ?? null
  );
};

const normalizePackageManager = (value: string | undefined) => {
  const packageManager = value?.split('@')[0]?.trim().toLowerCase();

  return packageManager || null;
};

const getDeclaredPackageManager = ({
  packageJson,
  packageJsonPath,
  rootPackageJson,
}: {
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  rootPackageJson: PackageJson | null;
}) => {
  const projectPackageManager = normalizePackageManager(packageJson?.packageManager);

  if (projectPackageManager) {
    return {
      source: packageJsonPath ? `${packageJsonPath} packageManager` : 'package.json packageManager',
      value: projectPackageManager,
    };
  }

  const rootPackageManager = normalizePackageManager(rootPackageJson?.packageManager);

  if (rootPackageManager) {
    return {
      source: 'package.json packageManager',
      value: rootPackageManager,
    };
  }

  return {
    source: null,
    value: null,
  };
};

const getDependencyNames = (packageJson: PackageJson | null, section: DependencySection) =>
  Object.keys(packageJson?.[section] ?? {});

const isDevOnlyDependency = (dependencyName: string) => {
  return (
    dependencyAnalysisConfig.devOnlyDependencyNames.includes(
      dependencyName as (typeof dependencyAnalysisConfig.devOnlyDependencyNames)[number],
    ) ||
    dependencyAnalysisConfig.devOnlyDependencyPrefixes.some((prefix) =>
      dependencyName.startsWith(prefix),
    )
  );
};

const getMisplacedDevDependencySources = ({
  packageJson,
  packageJsonPath,
}: {
  packageJson: PackageJson | null;
  packageJsonPath: string;
}) => {
  return getDependencyNames(packageJson, 'dependencies')
    .filter(isDevOnlyDependency)
    .map((dependencyName) => ({
      dependencyName,
      source: `${packageJsonPath} dependencies.${dependencyName}`,
    }));
};

const uniqueStrings = (values: readonly string[]) => [...new Set(values)];

export const buildDependencyHealth = ({
  lockfiles,
  packageJson,
  packageJsonPath,
  rootPackageJson,
}: {
  lockfiles: LockfileSignal[];
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  rootPackageJson: PackageJson | null;
}): DependencyHealth => {
  const declaredPackageManager = getDeclaredPackageManager({
    packageJson,
    packageJsonPath,
    rootPackageJson,
  });
  const lockfilePackageManagers = uniqueStrings(
    lockfiles
      .map((lockfile) => lockfile.packageManager)
      .filter((packageManager): packageManager is string => packageManager !== null),
  );
  const primaryPackageManager =
    lockfiles.find((lockfile) => lockfile.scope === 'project')?.packageManager ??
    lockfiles[0]?.packageManager ??
    declaredPackageManager.value ??
    null;
  const projectMisplacedDependencies = getMisplacedDevDependencySources({
    packageJson,
    packageJsonPath: packageJsonPath ?? 'package.json',
  });
  const rootMisplacedDependencies =
    rootPackageJson && rootPackageJson !== packageJson
      ? getMisplacedDevDependencySources({
          packageJson: rootPackageJson,
          packageJsonPath: 'package.json',
        })
      : [];
  const misplacedDependencies = [...projectMisplacedDependencies, ...rootMisplacedDependencies];

  return {
    declaredPackageManager: declaredPackageManager.value,
    declaredPackageManagerSource: declaredPackageManager.source,
    hasMixedLockfiles: lockfilePackageManagers.length > 1,
    lockfiles,
    misplacedDevDependencies: uniqueStrings(
      misplacedDependencies.map((dependency) => dependency.dependencyName),
    ),
    misplacedDevDependencySources: uniqueStrings(
      misplacedDependencies.map((dependency) => dependency.source),
    ),
    packageManagerMismatch:
      declaredPackageManager.value !== null &&
      primaryPackageManager !== null &&
      declaredPackageManager.value !== primaryPackageManager,
    primaryPackageManager,
  };
};
