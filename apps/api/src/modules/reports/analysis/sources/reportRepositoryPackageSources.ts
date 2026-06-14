import {
  compactSources,
  createSource,
  sourceFromPathSignal,
  type AnalysisSource,
} from './reportAnalysisSourceBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildRepositoryPackageSources = (
  signals: RepositorySignals,
  repository?: { name: string; owner: string },
): AnalysisSource[] => {
  const sources: AnalysisSource[] = [
    createSource({
      id: 'github-repository-metadata',
      kind: 'github_api',
      label: 'GitHub repository metadata',
      scope: 'github',
      source: repository ? `GET /repos/${repository.owner}/${repository.name}` : 'GitHub REST API',
      status: 'found',
    }),
    createSource({
      description: signals.packageJson.exists ? undefined : 'Selected package.json was not found.',
      id: 'project-package-json',
      kind: 'package_json',
      label: 'Selected package.json',
      scope: 'project',
      source: signals.packageJson.path,
      status: signals.packageJson.exists ? 'found' : 'missing',
    }),
    sourceFromPathSignal({
      id: 'readme',
      label: 'README',
      missingDescription: 'README file was not found.',
      signal: signals.readme,
    }),
    sourceFromPathSignal({
      id: 'env-example',
      label: 'Environment example',
      missingDescription: 'Environment example file was not found.',
      signal: signals.envExample,
    }),
    sourceFromPathSignal({
      id: 'lockfile',
      label: 'Package lockfile',
      missingDescription: 'Package lockfile was not found.',
      signal: signals.lockfile,
    }),
    createSource({
      description: signals.dependencyHealth.hasMixedLockfiles
        ? 'Multiple package manager lockfiles were found.'
        : 'Lockfile set matches one package manager.',
      id: 'lockfile-consistency',
      kind: 'file',
      label: 'Lockfile consistency',
      scope: signals.lockfile.scope ?? 'project',
      source: compactSources(signals.dependencyHealth.lockfiles.map((lockfile) => lockfile.path)),
      status: signals.dependencyHealth.hasMixedLockfiles
        ? 'warning'
        : signals.lockfile.exists
          ? 'found'
          : 'missing',
    }),
    createSource({
      description: signals.dependencyHealth.packageManagerMismatch
        ? 'package.json packageManager does not match the detected lockfile.'
        : signals.dependencyHealth.primaryPackageManager
          ? 'Package manager was inferred from lockfile/package metadata.'
          : 'Package manager was not detected.',
      id: 'package-manager',
      kind: 'package_json',
      label: 'Package manager',
      scope: signals.packageJson.scope ?? 'project',
      source:
        signals.dependencyHealth.declaredPackageManagerSource ??
        signals.lockfile.path ??
        signals.packageJson.path,
      status: signals.dependencyHealth.packageManagerMismatch
        ? 'warning'
        : signals.dependencyHealth.primaryPackageManager
          ? 'found'
          : 'missing',
    }),
    createSource({
      description:
        signals.dependencyHealth.misplacedDevDependencySources.length > 0
          ? 'Dev-only tooling dependencies were found in production dependencies.'
          : 'No dev-only tooling dependencies were found in production dependencies.',
      id: 'dependency-hygiene',
      kind: 'dependency',
      label: 'Dependency hygiene',
      scope:
        signals.isNestedProject &&
        signals.dependencyHealth.misplacedDevDependencySources.some((source) =>
          source.startsWith('package.json '),
        )
          ? 'root'
          : 'project',
      source: compactSources(signals.dependencyHealth.misplacedDevDependencySources),
      status:
        signals.dependencyHealth.misplacedDevDependencySources.length > 0 ? 'warning' : 'found',
    }),
  ];

  if (signals.isNestedProject) {
    sources.splice(
      2,
      0,
      createSource({
        description: signals.rootPackageJson.exists
          ? undefined
          : 'Root package.json was not found for this monorepo project.',
        id: 'root-package-json',
        kind: 'package_json',
        label: 'Root package.json',
        scope: 'root',
        source: signals.rootPackageJson.path,
        status: signals.rootPackageJson.exists ? 'found' : 'missing',
      }),
    );
  }

  return sources;
};
