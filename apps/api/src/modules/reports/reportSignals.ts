import {
  evidenceSourceConfig,
  readmeQualityConfig,
  repositorySignalConfig,
} from './reportAnalysisConfig.js';

import { joinRepositoryPath } from './githubRepositoryReader.js';

import type { GithubRepositoryReader, PackageJson } from './githubRepositoryReader.js';

type ScriptName = 'build' | 'lint' | 'test';
type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

export interface PathSignal {
  exists: boolean;
  path: string | null;
}

export interface ScriptSignal {
  exists: boolean;
  name: ScriptName;
  source: string | null;
  value: string | null;
}

export interface ToolSignal {
  configPaths: string[];
  dependencies: string[];
  found: boolean;
  sources: string[];
}

export interface RepositorySignals {
  a11yTooling: ToolSignal;
  bundler: ToolSignal;
  ci: {
    exists: boolean;
    source: string | null;
    workflowNames: string[];
  };
  envExample: PathSignal;
  lockfile: PathSignal & {
    packageManager: string | null;
  };
  packageJson: {
    dependencies: string[];
    exists: boolean;
    path: string | null;
    scripts: Record<ScriptName, ScriptSignal>;
  };
  readme: PathSignal & {
    hasInstallSection: boolean;
    hasUsageSection: boolean;
    isSubstantial: boolean;
    length: number;
  };
  storybook: ToolSignal;
  testingLibrary: ToolSignal;
  typescript: ToolSignal;
}

const getScript = (packageJson: PackageJson | null, scriptName: ScriptName) => {
  const script = packageJson?.scripts?.[scriptName];

  return typeof script === 'string' ? script : null;
};

const getDependencyNames = (packageJson: PackageJson | null) => {
  const dependencyNames = [
    ...Object.keys(packageJson?.dependencies ?? {}),
    ...Object.keys(packageJson?.devDependencies ?? {}),
    ...Object.keys(packageJson?.optionalDependencies ?? {}),
    ...Object.keys(packageJson?.peerDependencies ?? {}),
  ];

  return [...new Set(dependencyNames)].sort((left, right) => left.localeCompare(right));
};

const dependencySections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const satisfies readonly DependencySection[];

const getDependencySourceMap = (
  packageJson: PackageJson | null,
  packageJsonPath: string | null,
) => {
  const sourceMap = new Map<string, string>();

  if (!packageJson || !packageJsonPath) {
    return sourceMap;
  }

  for (const section of dependencySections) {
    for (const dependencyName of Object.keys(packageJson[section] ?? {})) {
      sourceMap.set(dependencyName, `${packageJsonPath} ${section}.${dependencyName}`);
    }
  }

  return sourceMap;
};

const getMatchingDependencies = (
  dependencyNames: readonly string[],
  expectedDependencyNames: readonly string[],
) => {
  const dependencies = new Set(dependencyNames);

  return expectedDependencyNames.filter((dependencyName) => dependencies.has(dependencyName));
};

const getDependencySources = (
  dependencyNames: readonly string[],
  dependencySourceMap: ReadonlyMap<string, string>,
) => {
  return dependencyNames.map(
    (dependencyName) => dependencySourceMap.get(dependencyName) ?? dependencyName,
  );
};

const createScriptSignal = (
  packageJson: PackageJson | null,
  packageJsonPath: string | null,
  scriptName: ScriptName,
): ScriptSignal => {
  const value = getScript(packageJson, scriptName);

  return {
    exists: value !== null,
    name: scriptName,
    source: packageJsonPath ? `${packageJsonPath} scripts.${scriptName}` : null,
    value,
  };
};

const createPathSignal = (path: string | null): PathSignal => ({
  exists: path !== null,
  path,
});

const createToolSignal = ({
  configPaths = [],
  dependencies,
  sources,
}: {
  configPaths?: string[];
  dependencies: string[];
  sources?: string[];
}): ToolSignal => {
  const signalSources = sources ?? [...configPaths, ...dependencies];

  return {
    configPaths,
    dependencies,
    found: signalSources.length > 0,
    sources: signalSources,
  };
};

const hasTextPattern = (content: string, patterns: readonly RegExp[]) => {
  return patterns.some((pattern) => pattern.test(content));
};

const prefixPaths = (projectPath: string, paths: readonly string[]) => {
  return paths.map((path) => joinRepositoryPath(projectPath, path));
};

const withProjectFallbackPaths = (projectPath: string, paths: readonly string[]) => {
  return [...new Set([...prefixPaths(projectPath, paths), ...paths])];
};

const getPackageManager = (lockfilePath: string | null) => {
  const lockfileName = lockfilePath?.split('/').at(-1) ?? null;

  switch (lockfileName) {
    case 'bun.lock':
    case 'bun.lockb':
      return 'bun';
    case 'package-lock.json':
      return 'npm';
    case 'pnpm-lock.yaml':
      return 'pnpm';
    case 'yarn.lock':
      return 'yarn';
    default:
      return null;
  }
};

const getWorkflowSource = (workflowNames: readonly string[]) => {
  if (workflowNames.length === 0) {
    return null;
  }

  const workflowPaths = workflowNames.map((workflowName) => `.github/workflows/${workflowName}`);

  if (workflowPaths.length <= evidenceSourceConfig.workflowPreviewLimit) {
    return workflowPaths.join(', ');
  }

  const visibleWorkflowPaths = workflowPaths.slice(0, evidenceSourceConfig.workflowPreviewLimit);
  const hiddenWorkflowCount = workflowPaths.length - visibleWorkflowPaths.length;

  return `${visibleWorkflowPaths.join(', ')}, +${hiddenWorkflowCount} more`;
};

const getValidWorkflowNames = (workflowNames: readonly string[]) => {
  return workflowNames.filter((workflowName) => /\.ya?ml$/i.test(workflowName));
};

export const collectRepositorySignals = async ({
  branch,
  owner,
  packageJson,
  packageJsonPath,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
}) => {
  const [readmeFile, typescriptPath, workflowNames, envExamplePath, lockfilePath, storybookPath] =
    await Promise.all([
      reader.readFirstTextFile(
        owner,
        repository,
        branch,
        withProjectFallbackPaths(projectPath, repositorySignalConfig.readmePaths),
      ),
      reader.findFirstPath(
        owner,
        repository,
        branch,
        withProjectFallbackPaths(projectPath, repositorySignalConfig.typescriptPaths),
      ),
      reader.listDirectoryFiles(owner, repository, branch, repositorySignalConfig.workflowsPath),
      reader.findFirstPath(
        owner,
        repository,
        branch,
        withProjectFallbackPaths(projectPath, repositorySignalConfig.envExamplePaths),
      ),
      reader.findFirstPath(
        owner,
        repository,
        branch,
        withProjectFallbackPaths(projectPath, repositorySignalConfig.lockfilePaths),
      ),
      reader.findFirstPath(
        owner,
        repository,
        branch,
        withProjectFallbackPaths(projectPath, repositorySignalConfig.storybookPaths),
      ),
    ]);

  const dependencies = getDependencyNames(packageJson);
  const dependencySourceMap = getDependencySourceMap(packageJson, packageJsonPath);
  const validWorkflowNames = getValidWorkflowNames(workflowNames);
  const a11yDependencies = getMatchingDependencies(
    dependencies,
    repositorySignalConfig.a11yDependencies,
  );
  const bundlerDependencies = getMatchingDependencies(
    dependencies,
    repositorySignalConfig.bundlerDependencies,
  );
  const storybookDependencies = getMatchingDependencies(
    dependencies,
    repositorySignalConfig.storybookDependencies,
  );
  const testingDependencies = getMatchingDependencies(
    dependencies,
    repositorySignalConfig.testingDependencies,
  );
  const typescriptDependencies = getMatchingDependencies(
    dependencies,
    repositorySignalConfig.typescriptDependencies,
  );

  return {
    a11yTooling: createToolSignal({
      dependencies: a11yDependencies,
      sources: getDependencySources(a11yDependencies, dependencySourceMap),
    }),
    bundler: createToolSignal({
      dependencies: bundlerDependencies,
      sources: getDependencySources(bundlerDependencies, dependencySourceMap),
    }),
    ci: {
      exists: validWorkflowNames.length > 0,
      source: getWorkflowSource(validWorkflowNames),
      workflowNames: validWorkflowNames,
    },
    envExample: createPathSignal(envExamplePath),
    lockfile: {
      ...createPathSignal(lockfilePath),
      packageManager: getPackageManager(lockfilePath),
    },
    packageJson: {
      dependencies,
      exists: packageJson !== null,
      path: packageJsonPath,
      scripts: {
        build: createScriptSignal(packageJson, packageJsonPath, 'build'),
        lint: createScriptSignal(packageJson, packageJsonPath, 'lint'),
        test: createScriptSignal(packageJson, packageJsonPath, 'test'),
      },
    },
    readme: {
      ...createPathSignal(readmeFile?.path ?? null),
      hasInstallSection: readmeFile
        ? hasTextPattern(readmeFile.content, readmeQualityConfig.installSectionPatterns)
        : false,
      hasUsageSection: readmeFile
        ? hasTextPattern(readmeFile.content, readmeQualityConfig.usageSectionPatterns)
        : false,
      isSubstantial: readmeFile
        ? readmeFile.content.length >= readmeQualityConfig.minLength
        : false,
      length: readmeFile?.content.length ?? 0,
    },
    storybook: createToolSignal({
      configPaths: storybookPath ? [storybookPath] : [],
      dependencies: storybookDependencies,
      sources: [
        ...(storybookPath ? [storybookPath] : []),
        ...getDependencySources(storybookDependencies, dependencySourceMap),
      ],
    }),
    testingLibrary: createToolSignal({
      dependencies: testingDependencies,
      sources: getDependencySources(testingDependencies, dependencySourceMap),
    }),
    typescript: createToolSignal({
      configPaths: typescriptPath ? [typescriptPath] : [],
      dependencies: typescriptDependencies,
      sources: [
        ...(typescriptPath ? [typescriptPath] : []),
        ...getDependencySources(typescriptDependencies, dependencySourceMap),
      ],
    }),
  } satisfies RepositorySignals;
};
