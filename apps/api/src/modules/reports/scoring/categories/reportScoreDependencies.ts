import {
  createCheck,
  createMetric,
  createPathCheck,
  getScope,
} from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../analysis/signals/reportSignals.js';
import type { ScoringCheck } from '../reportScoringEngine.js';

const getLockfileCheck = (signals: RepositorySignals): ScoringCheck => {
  if (!signals.lockfile.exists) {
    return createCheck({
      description: 'No package lockfile was found.',
      earned: 0,
      id: 'lockfile',
      label: 'Package lockfile',
      max: 25,
      scope: 'project',
      severity: 'major',
      source: 'lockfile',
      status: 'failed',
      confidence: 'high',
    });
  }

  if (signals.lockfile.scope === 'root' && signals.isNestedProject && !signals.workspace?.matched) {
    return createCheck({
      description:
        'Only a root-level package lockfile was found and the selected package was not confirmed as workspace-managed.',
      earned: 12,
      id: 'lockfile',
      label: 'Package lockfile',
      max: 25,
      scope: 'root',
      severity: 'major',
      source: signals.lockfile.path ?? 'lockfile',
      status: 'partial',
      confidence: 'medium',
    });
  }

  return createCheck({
    description:
      signals.lockfile.scope === 'root' && signals.isNestedProject
        ? 'Root-level lockfile is valid because the selected package matches a workspace.'
        : undefined,
    earned: 25,
    id: 'lockfile',
    label: 'Package lockfile',
    max: 25,
    scope:
      signals.lockfile.scope === 'root' && signals.workspace?.matched
        ? 'workspace'
        : getScope(signals.lockfile.scope, 'project'),
    severity: 'major',
    source: signals.lockfile.path ?? 'lockfile',
    status: 'passed',
    confidence: 'high',
  });
};

const getPackageManagerCheck = (signals: RepositorySignals): ScoringCheck => {
  if (!signals.dependencyHealth.primaryPackageManager) {
    return createCheck({
      description: 'Package manager was not detected.',
      earned: 0,
      id: 'package-manager',
      label: 'Package manager',
      max: 20,
      scope: 'project',
      severity: 'major',
      source: signals.packageJson.path ?? signals.lockfile.path ?? 'package.json',
      status: 'failed',
      confidence: 'high',
    });
  }

  if (signals.dependencyHealth.packageManagerMismatch) {
    return createCheck({
      description: 'package.json packageManager does not match the detected lockfile.',
      earned: 8,
      id: 'package-manager',
      label: 'Package manager',
      max: 20,
      scope: 'project',
      severity: 'major',
      source: signals.dependencyHealth.declaredPackageManagerSource ?? signals.lockfile.path ?? '',
      status: 'partial',
      confidence: 'high',
    });
  }

  return createCheck({
    description: 'Package manager was detected from lockfile or package metadata.',
    earned: 20,
    id: 'package-manager',
    label: 'Package manager',
    max: 20,
    scope:
      signals.lockfile.scope === 'root' && signals.workspace?.matched ? 'workspace' : 'project',
    severity: 'major',
    source:
      signals.dependencyHealth.declaredPackageManagerSource ??
      signals.lockfile.path ??
      signals.packageJson.path ??
      'package.json',
    status: 'passed',
    confidence: 'high',
  });
};

const getLockfileConsistencyCheck = (signals: RepositorySignals): ScoringCheck => {
  if (!signals.lockfile.exists) {
    return createCheck({
      description: 'No package lockfile was found.',
      earned: 0,
      id: 'lockfile-consistency',
      label: 'Lockfile consistency',
      max: 15,
      scope: 'project',
      severity: 'major',
      source: 'lockfile',
      status: 'failed',
      confidence: 'high',
    });
  }

  return createCheck({
    description: signals.dependencyHealth.hasMixedLockfiles
      ? 'Multiple package manager lockfiles were found.'
      : 'Lockfiles point to one package manager.',
    earned: signals.dependencyHealth.hasMixedLockfiles ? 5 : 15,
    id: 'lockfile-consistency',
    label: 'Lockfile consistency',
    max: 15,
    scope:
      signals.lockfile.scope === 'root' && signals.workspace?.matched ? 'workspace' : 'project',
    severity: 'major',
    source:
      signals.dependencyHealth.lockfiles.map((lockfile) => lockfile.path).join(', ') ||
      signals.lockfile.path ||
      'lockfile',
    status: signals.dependencyHealth.hasMixedLockfiles ? 'partial' : 'passed',
    confidence: 'high',
  });
};

const getDependencyHygieneCheck = (signals: RepositorySignals): ScoringCheck => {
  const sources = signals.dependencyHealth.misplacedDevDependencySources;

  return createCheck({
    description:
      sources.length > 0
        ? 'Dev-only tooling dependencies were found in production dependencies.'
        : 'No dev-only tooling dependencies were found in production dependencies.',
    earned: sources.length > 0 ? 4 : 15,
    id: 'dependency-hygiene',
    label: 'Dependency hygiene',
    max: 15,
    scope: 'project',
    severity: 'minor',
    source: sources.join(', '),
    status: sources.length > 0 ? 'partial' : 'passed',
    confidence: 'high',
  });
};

export const buildDependenciesScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'dependencies',
    label: 'Dependencies',
    description: 'Package metadata and lockfile consistency signals.',
    checks: [
      createPathCheck({
        id: 'package-json',
        label: 'package.json',
        max: 25,
        missingDescription: 'package.json was not found.',
        partialEarned: 0,
        severity: 'critical',
        signal: {
          exists: signals.packageJson.exists,
          path: signals.packageJson.path,
          scope: signals.packageJson.scope,
        },
        signals,
      }),
      getLockfileCheck(signals),
      getPackageManagerCheck(signals),
      getLockfileConsistencyCheck(signals),
      getDependencyHygieneCheck(signals),
    ],
  });
