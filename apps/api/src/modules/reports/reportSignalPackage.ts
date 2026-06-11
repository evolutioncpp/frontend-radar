import type { PackageJson } from './githubRepositoryReader.js';
import type {
  DependencySection,
  PackageJsonSignal,
  ScriptName,
  ScriptSignal,
  SignalScope,
} from './reportSignalTypes.js';
import { createDependencySource, type ToolingSource } from './reportToolingSources.js';

const getScript = (packageJson: PackageJson | null, scriptName: ScriptName) => {
  const script = packageJson?.scripts?.[scriptName];

  return typeof script === 'string' ? script : null;
};

export const getDependencyNames = (packageJson: PackageJson | null) => {
  const dependencyNames = [
    ...Object.keys(packageJson?.dependencies ?? {}),
    ...Object.keys(packageJson?.devDependencies ?? {}),
    ...Object.keys(packageJson?.optionalDependencies ?? {}),
    ...Object.keys(packageJson?.peerDependencies ?? {}),
  ];

  return [...new Set(dependencyNames)].sort((left, right) => left.localeCompare(right));
};

export const dependencySections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const satisfies readonly DependencySection[];

export const getDependencySourceMap = (
  packageJson: PackageJson | null,
  packageJsonPath: string | null,
) => {
  const sourceMap = new Map<string, ToolingSource>();

  if (!packageJson || !packageJsonPath) {
    return sourceMap;
  }

  for (const section of dependencySections) {
    for (const dependencyName of Object.keys(packageJson[section] ?? {})) {
      sourceMap.set(
        dependencyName,
        createDependencySource({
          name: dependencyName,
          packageJsonPath,
          section,
        }),
      );
    }
  }

  return sourceMap;
};

export const createScriptSignal = ({
  packageJson,
  packageJsonPath,
  scope,
  scriptName,
}: {
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  scope: SignalScope;
  scriptName: ScriptName;
}): ScriptSignal => {
  const value = getScript(packageJson, scriptName);

  return {
    exists: value !== null,
    name: scriptName,
    scope: value !== null ? scope : null,
    source: value && packageJsonPath ? `${packageJsonPath} scripts.${scriptName}` : null,
    value,
  };
};

export const createEffectiveScriptSignal = ({
  projectPackageJson,
  projectPackageJsonPath,
  rootPackageJson,
  scriptName,
  useRootFallback,
}: {
  projectPackageJson: PackageJson | null;
  projectPackageJsonPath: string | null;
  rootPackageJson: PackageJson | null;
  scriptName: ScriptName;
  useRootFallback: boolean;
}) => {
  const projectSignal = createScriptSignal({
    packageJson: projectPackageJson,
    packageJsonPath: projectPackageJsonPath,
    scope: 'project',
    scriptName,
  });

  if (projectSignal.exists || !useRootFallback) {
    return projectSignal;
  }

  return createScriptSignal({
    packageJson: rootPackageJson,
    packageJsonPath: 'package.json',
    scope: 'root',
    scriptName,
  });
};

export const createPackageJsonSignal = ({
  dependencies,
  packageJson,
  path,
  scripts,
  scope,
}: {
  dependencies: string[];
  packageJson: PackageJson | null;
  path: string | null;
  scripts: Record<ScriptName, ScriptSignal>;
  scope: SignalScope;
}): PackageJsonSignal => ({
  dependencies,
  exists: packageJson !== null,
  path,
  scripts,
  scope: packageJson ? scope : null,
  workspaces: packageJson?.workspaces ?? [],
});

const normalizeWorkspacePath = (path: string) => {
  const normalizedPath = path
    .replace(/\\/gu, '/')
    .replace(/\/package\.json$/iu, '')
    .replace(/^\.\/+/u, '')
    .replace(/\/+$/u, '');

  return normalizedPath === '.' ? '' : normalizedPath;
};

const matchesWorkspacePattern = (projectPath: string, pattern: string) => {
  const normalizedProjectPath = normalizeWorkspacePath(projectPath);
  const normalizedPattern = normalizeWorkspacePath(pattern);

  if (!normalizedProjectPath || !normalizedPattern) {
    return false;
  }

  if (!normalizedPattern.includes('*')) {
    return normalizedProjectPath === normalizedPattern;
  }

  if (!normalizedPattern.endsWith('/*')) {
    return false;
  }

  const basePath = normalizedPattern.slice(0, -2);

  return normalizedProjectPath.startsWith(`${basePath}/`);
};

export const getWorkspaceMatch = (projectPath: string, rootPackageJson: PackageJson | null) => {
  if (!projectPath || !rootPackageJson?.workspaces?.length) {
    return {
      matched: false,
      source: null,
    };
  }

  const matchedPattern = rootPackageJson.workspaces.find((pattern) =>
    matchesWorkspacePattern(projectPath, pattern),
  );

  return {
    matched: matchedPattern !== undefined,
    source: matchedPattern ? `package.json workspaces.${matchedPattern}` : null,
  };
};
