import { repositorySignalConfig } from '../../domain/reportAnalysisConfig.js';
import { joinRepositoryPath } from '../../domain/reportPathUtils.js';

import type { PackageJson } from '../../application/ports/reportRepositoryReader.js';
import type { ProjectReport, ReportProjectPathSource } from '../../domain/reportSchemas.js';
import type { ReportProjectDetectionSignalId } from '../../domain/reportSignalContracts.js';

export type ReportProjectDetection = ProjectReport['repository']['projectDetection'];
type ReportProjectDetectionSignal = ReportProjectDetection['signals'][number];
type ReportProjectDetectionSignalStatus = ReportProjectDetectionSignal['status'];

const dependencySections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;
const frontendPathSegmentSet = new Set<string>(repositorySignalConfig.frontendPathSegments);

const projectDetectionSignalTexts: Record<
  ReportProjectDetectionSignalId,
  {
    label: string;
    descriptions: Partial<Record<ReportProjectDetectionSignalStatus, string>>;
  }
> = {
  'project-package-json': {
    label: 'Frontend package.json',
    descriptions: {
      found: 'package.json was found in the selected frontend folder.',
      missing: 'package.json was not found in the selected frontend folder.',
    },
  },
  'project-path-hint': {
    label: 'Frontend path hint',
    descriptions: {
      found: 'The selected path contains a common frontend folder name.',
      missing: 'The selected path does not contain a common frontend folder name.',
    },
  },
  'project-package-name': {
    label: 'Frontend package name',
    descriptions: {
      found: 'The package name looks like a frontend app.',
      missing: 'The package name does not include a common frontend hint.',
    },
  },
  'project-frontend-dependency': {
    label: 'Frontend dependency',
    descriptions: {
      found: 'A common frontend dependency was found in package.json.',
      missing: 'No common frontend dependency was found in package.json.',
    },
  },
  'project-build-script': {
    label: 'Build script',
    descriptions: {
      found: 'The selected package exposes a build script.',
      missing: 'The selected package does not expose a build script.',
    },
  },
  'project-test-script': {
    label: 'Test script',
    descriptions: {
      found: 'The selected package exposes a test script.',
      missing: 'The selected package does not expose a test script.',
    },
  },
  'project-workspace': {
    label: 'Workspace match',
    descriptions: {
      found: 'The selected path matches a workspace entry from the root package.json.',
      missing: 'The selected path was not matched to a root workspace entry.',
    },
  },
};

export const normalizeProjectPath = (path: string) => {
  const normalizedPath = joinRepositoryPath(
    path.replace(/\\/g, '/').replace(/\/package\.json$/i, ''),
  );

  return normalizedPath === '.' ? '' : normalizedPath;
};

export const uniqueProjectPaths = (paths: readonly string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const path of paths) {
    const normalizedPath = normalizeProjectPath(path);

    if (seen.has(normalizedPath)) {
      continue;
    }

    seen.add(normalizedPath);
    result.push(normalizedPath);
  }

  return result;
};

const getDependencyNames = (packageJson: PackageJson | null) => {
  if (!packageJson) {
    return [];
  }

  return dependencySections.flatMap((section) => Object.keys(packageJson[section] ?? {}));
};

const getScriptNames = (packageJson: PackageJson | null) => {
  if (!packageJson?.scripts) {
    return [];
  }

  return Object.keys(packageJson.scripts);
};

const hasAnyMatch = (values: readonly string[], expectedValues: readonly string[]) => {
  const valueSet = new Set(values);

  return expectedValues.some((value) => valueSet.has(value));
};

const getPathHintScore = (projectPath: string) => {
  if (!projectPath) {
    return 0;
  }

  const segments = projectPath.toLowerCase().split('/');

  return segments.some((segment) => frontendPathSegmentSet.has(segment)) ? 24 : 0;
};

const getNameHintScore = (packageJson: PackageJson | null) => {
  const packageName = packageJson?.name?.toLowerCase();

  if (!packageName) {
    return 0;
  }

  return [...frontendPathSegmentSet].some((segment) => packageName.includes(segment)) ? 18 : 0;
};

export const getProjectScore = (projectPath: string, packageJson: PackageJson | null) => {
  if (!packageJson) {
    return Number.NEGATIVE_INFINITY;
  }

  const dependencies = getDependencyNames(packageJson);
  const scripts = getScriptNames(packageJson);
  const hasFrontendDependency = hasAnyMatch(
    dependencies,
    repositorySignalConfig.frontendDependencies,
  );
  const hasBuildScript = scripts.includes('build');
  const hasTestScript = scripts.includes('test');

  return (
    10 +
    (projectPath ? 8 : 0) +
    getPathHintScore(projectPath) +
    getNameHintScore(packageJson) +
    (hasFrontendDependency ? 45 : 0) +
    (hasBuildScript ? 8 : 0) +
    (hasTestScript ? 5 : 0)
  );
};

export const getWorkspacePatterns = (rootPackageJson: PackageJson | null) => {
  return rootPackageJson?.workspaces ?? [];
};

export const matchesWorkspacePattern = (projectPath: string, pattern: string) => {
  const normalizedPattern = normalizeProjectPath(pattern);

  if (!projectPath || !normalizedPattern) {
    return false;
  }

  if (!normalizedPattern.includes('*')) {
    return normalizeProjectPath(projectPath) === normalizedPattern;
  }

  if (!normalizedPattern.endsWith('/*')) {
    return false;
  }

  const basePath = normalizedPattern.slice(0, -2);

  return projectPath.startsWith(`${basePath}/`);
};

const getConfidence = (projectPath: string, packageJson: PackageJson | null) => {
  const score = getProjectScore(projectPath, packageJson);

  if (score >= 70) {
    return 'high';
  }

  if (score >= 45) {
    return 'medium';
  }

  return 'low';
};

const createProjectDetectionSignal = ({
  id,
  source,
  status,
}: {
  id: ReportProjectDetectionSignalId;
  source?: string;
  status: ReportProjectDetectionSignalStatus;
}): ReportProjectDetectionSignal => {
  const fallback = projectDetectionSignalTexts[id];
  const description = fallback.descriptions[status];

  return {
    id,
    status,
    label: fallback.label,
    ...(description ? { description } : {}),
    ...(source ? { source } : {}),
  };
};

export const buildProjectDetection = ({
  packageJson,
  packageJsonPath,
  projectPath,
  rootPackageJson,
  source,
}: {
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectPath: string;
  rootPackageJson: PackageJson | null;
  source: ReportProjectPathSource;
}): ReportProjectDetection => {
  const dependencies = getDependencyNames(packageJson);
  const scripts = getScriptNames(packageJson);
  const frontendDependencies = dependencies.filter((dependency) =>
    repositorySignalConfig.frontendDependencies.includes(
      dependency as (typeof repositorySignalConfig.frontendDependencies)[number],
    ),
  );
  const hasPathHint = getPathHintScore(projectPath) > 0;
  const hasNameHint = getNameHintScore(packageJson) > 0;
  const workspacePatterns = getWorkspacePatterns(rootPackageJson);
  const hasWorkspaceMatch = workspacePatterns.some((pattern) =>
    matchesWorkspacePattern(projectPath, pattern),
  );
  const signals = [
    createProjectDetectionSignal({
      id: 'project-package-json',
      source: packageJsonPath ?? undefined,
      status: packageJson ? 'found' : 'missing',
    }),
    createProjectDetectionSignal({
      id: 'project-path-hint',
      source: projectPath || undefined,
      status: hasPathHint ? 'found' : 'missing',
    }),
    createProjectDetectionSignal({
      id: 'project-package-name',
      source: packageJson?.name,
      status: hasNameHint ? 'found' : 'missing',
    }),
    createProjectDetectionSignal({
      id: 'project-frontend-dependency',
      source: frontendDependencies.join(', ') || undefined,
      status: frontendDependencies.length > 0 ? 'found' : 'missing',
    }),
    createProjectDetectionSignal({
      id: 'project-build-script',
      source: scripts.includes('build') ? 'package.json scripts.build' : undefined,
      status: scripts.includes('build') ? 'found' : 'missing',
    }),
    createProjectDetectionSignal({
      id: 'project-test-script',
      source: scripts.includes('test') ? 'package.json scripts.test' : undefined,
      status: scripts.includes('test') ? 'found' : 'missing',
    }),
    ...(projectPath && workspacePatterns.length > 0
      ? [
          createProjectDetectionSignal({
            id: 'project-workspace',
            source: hasWorkspaceMatch ? rootPackageJson?.workspaces?.join(', ') : undefined,
            status: hasWorkspaceMatch ? 'found' : 'missing',
          }),
        ]
      : []),
  ];

  return {
    confidence: getConfidence(projectPath, packageJson),
    packageJsonPath,
    path: projectPath || null,
    signals,
    source,
  };
};

export const getPackageJsonPath = (projectPath: string, packageJson: PackageJson | null) => {
  if (!packageJson) {
    return null;
  }

  return joinRepositoryPath(projectPath, 'package.json');
};
