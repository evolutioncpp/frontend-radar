import { firstSource } from './reportRecommendationHelpers.js';

import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const addPackageMetadataRecommendation = {
  id: 'add-package-metadata',
  severity: 'high',
  categories: ['dependencies'],
  checkIds: ['package-json'],
  impactLevel: 'key',
  effort: 'medium',
  title: 'Add package metadata',
  description:
    'Add package.json so scripts, dependencies and project tooling can be installed and checked consistently.',
  action: 'Create package.json for the analyzed frontend package and commit the scripts it needs.',
  isApplicable: (signals) => !signals.packageJson.exists,
} as const satisfies RecommendationDefinition;

export const commitLockfileRecommendation = {
  id: 'commit-lockfile',
  severity: 'medium',
  categories: ['dependencies'],
  checkIds: ['lockfile'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Commit a package lockfile',
  description: 'A lockfile keeps dependency installs reproducible across machines and CI.',
  action: 'Generate and commit the lockfile for the package manager used by this project.',
  isApplicable: (signals) => signals.packageJson.exists && !signals.lockfile.exists,
  getSource: (signals) => signals.packageJson.path ?? undefined,
} as const satisfies RecommendationDefinition;

export const removeMixedLockfilesRecommendation = {
  id: 'remove-mixed-lockfiles',
  severity: 'medium',
  categories: ['dependencies'],
  checkIds: ['lockfile-consistency'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Use one package manager lockfile',
  description:
    'Keep one package manager lockfile so local and CI installs resolve dependencies consistently.',
  action: 'Remove extra lockfiles and keep the one that matches the chosen package manager.',
  isApplicable: (signals) => signals.dependencyHealth.hasMixedLockfiles,
  getSource: (signals) =>
    firstSource(...signals.dependencyHealth.lockfiles.map((lockfile) => lockfile.path)),
} as const satisfies RecommendationDefinition;

export const alignPackageManagerRecommendation = {
  id: 'align-package-manager',
  severity: 'medium',
  categories: ['dependencies'],
  checkIds: ['package-manager'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Align package manager metadata',
  description: 'Make package.json packageManager match the committed lockfile package manager.',
  action: 'Update packageManager metadata or regenerate the lockfile so both point to one tool.',
  isApplicable: (signals) => signals.dependencyHealth.packageManagerMismatch,
  getSource: (signals) => signals.dependencyHealth.declaredPackageManagerSource ?? undefined,
} as const satisfies RecommendationDefinition;

export const moveToolingToDevDependenciesRecommendation = {
  id: 'move-tooling-to-dev-dependencies',
  severity: 'medium',
  categories: ['dependencies'],
  checkIds: ['dependency-hygiene'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Move tooling to devDependencies',
  description:
    'Keep linting, testing and type tooling out of production dependencies where possible.',
  action: 'Move detected build/test/lint/type packages from dependencies to devDependencies.',
  isApplicable: (signals) => signals.dependencyHealth.misplacedDevDependencySources.length > 0,
  getSource: (signals) => firstSource(...signals.dependencyHealth.misplacedDevDependencySources),
} as const satisfies RecommendationDefinition;
