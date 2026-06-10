import {
  evidenceSourceConfig,
  readmeQualityConfig,
  repositorySignalConfig,
} from './reportAnalysisConfig.js';

import { joinRepositoryPath } from './githubRepositoryReader.js';

import type {
  GithubRepositoryReader,
  PackageJson,
  TextFileMatch,
} from './githubRepositoryReader.js';

export type SignalScope = 'project' | 'root' | 'github' | null;
type ScriptName = 'build' | 'lint' | 'test';
type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

export interface PathSignal {
  exists: boolean;
  path: string | null;
  scope?: SignalScope;
}

export interface ScriptSignal {
  exists: boolean;
  name: ScriptName;
  scope?: SignalScope;
  source: string | null;
  value: string | null;
}

export interface ToolSignal {
  configPaths: string[];
  dependencies: string[];
  found: boolean;
  projectSources?: string[];
  rootSources?: string[];
  sources: string[];
}

export interface PackageJsonSignal {
  dependencies: string[];
  exists: boolean;
  path: string | null;
  scripts: Record<ScriptName, ScriptSignal>;
  scope?: SignalScope;
}

export interface RepositorySignals {
  a11yTooling: ToolSignal;
  bundler: ToolSignal;
  ci: {
    exists: boolean;
    scope?: SignalScope;
    source: string | null;
    workflowNames: string[];
  };
  envExample: PathSignal;
  formatting: ToolSignal;
  frameworks: ToolSignal;
  isNestedProject: boolean;
  linting: ToolSignal;
  lockfile: PathSignal & {
    packageManager: string | null;
  };
  packageJson: PackageJsonSignal;
  projectPath: string;
  readme: PathSignal & {
    hasInstallSection: boolean;
    hasUsageSection: boolean;
    isSubstantial: boolean;
    length: number;
  };
  rootPackageJson: PackageJsonSignal;
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

const uniqueStrings = (values: readonly string[]) => [...new Set(values)];

const createScriptSignal = ({
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

const createEffectiveScriptSignal = ({
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

const createPathSignal = (path: string | null, scope: SignalScope): PathSignal => ({
  exists: path !== null,
  path,
  scope: path ? scope : null,
});

const createToolSignal = ({
  configPaths = [],
  dependencies,
  projectSources = [],
  rootSources = [],
}: {
  configPaths?: string[];
  dependencies: string[];
  projectSources?: string[];
  rootSources?: string[];
}): ToolSignal => {
  const sources = uniqueStrings([...projectSources, ...rootSources]);

  return {
    configPaths,
    dependencies,
    found: sources.length > 0,
    projectSources: uniqueStrings(projectSources),
    rootSources: uniqueStrings(rootSources),
    sources,
  };
};

const hasTextPattern = (content: string, patterns: readonly RegExp[]) => {
  return patterns.some((pattern) => pattern.test(content));
};

const prefixPaths = (projectPath: string, paths: readonly string[]) => {
  return paths.map((path) => joinRepositoryPath(projectPath, path));
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

const findScopedPath = async ({
  branch,
  owner,
  paths,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  paths: readonly string[];
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
}): Promise<PathSignal> => {
  if (!projectPath) {
    return createPathSignal(
      await reader.findFirstPath(owner, repository, branch, paths),
      'project',
    );
  }

  const projectPathMatch = await reader.findFirstPath(
    owner,
    repository,
    branch,
    prefixPaths(projectPath, paths),
  );

  if (projectPathMatch) {
    return createPathSignal(projectPathMatch, 'project');
  }

  return createPathSignal(await reader.findFirstPath(owner, repository, branch, paths), 'root');
};

const readScopedTextFile = async ({
  branch,
  owner,
  paths,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  paths: readonly string[];
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
}): Promise<(TextFileMatch & { scope: SignalScope }) | null> => {
  if (!projectPath) {
    const file = await reader.readFirstTextFile(owner, repository, branch, paths);

    return file ? { ...file, scope: 'project' } : null;
  }

  const projectFile = await reader.readFirstTextFile(
    owner,
    repository,
    branch,
    prefixPaths(projectPath, paths),
  );

  if (projectFile) {
    return { ...projectFile, scope: 'project' };
  }

  const rootFile = await reader.readFirstTextFile(owner, repository, branch, paths);

  return rootFile ? { ...rootFile, scope: 'root' } : null;
};

const buildScopedToolSignal = ({
  expectedDependencyNames,
  projectConfigPath,
  projectDependencyNames,
  projectDependencySourceMap,
  rootConfigPath,
  rootDependencyNames,
  rootDependencySourceMap,
}: {
  expectedDependencyNames: readonly string[];
  projectConfigPath?: string | null;
  projectDependencyNames: readonly string[];
  projectDependencySourceMap: ReadonlyMap<string, string>;
  rootConfigPath?: string | null;
  rootDependencyNames: readonly string[];
  rootDependencySourceMap: ReadonlyMap<string, string>;
}) => {
  const projectDependencies = getMatchingDependencies(
    projectDependencyNames,
    expectedDependencyNames,
  );
  const rootDependencies = getMatchingDependencies(
    rootDependencyNames,
    expectedDependencyNames,
  ).filter((dependencyName) => !projectDependencies.includes(dependencyName));
  const projectDependencySources = getDependencySources(
    projectDependencies,
    projectDependencySourceMap,
  );
  const rootDependencySources = getDependencySources(rootDependencies, rootDependencySourceMap);
  const projectSources = uniqueStrings([
    ...(projectConfigPath ? [projectConfigPath] : []),
    ...projectDependencySources,
  ]);
  const rootSources = uniqueStrings([
    ...(rootConfigPath ? [rootConfigPath] : []),
    ...rootDependencySources,
  ]);

  return createToolSignal({
    configPaths: uniqueStrings([
      ...(projectConfigPath ? [projectConfigPath] : []),
      ...(rootConfigPath ? [rootConfigPath] : []),
    ]),
    dependencies: uniqueStrings([...projectDependencies, ...rootDependencies]),
    projectSources,
    rootSources,
  });
};

const createPackageJsonSignal = ({
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
});

export const collectRepositorySignals = async ({
  branch,
  owner,
  packageJson,
  packageJsonPath,
  projectPath,
  reader,
  repository,
  rootPackageJson,
}: {
  branch: string;
  owner: string;
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectPath: string;
  reader: GithubRepositoryReader;
  repository: string;
  rootPackageJson?: PackageJson | null;
}) => {
  const isNestedProject = projectPath !== '';
  const rootPackage = rootPackageJson ?? (isNestedProject ? null : packageJson);
  const projectPackageJson = packageJson;
  const projectDependencyNames = getDependencyNames(projectPackageJson);
  const rootDependencyNames = isNestedProject ? getDependencyNames(rootPackage) : [];
  const projectDependencySourceMap = getDependencySourceMap(projectPackageJson, packageJsonPath);
  const rootDependencySourceMap = getDependencySourceMap(rootPackage, 'package.json');
  const [
    readmeFile,
    typescriptPath,
    workflowNames,
    envExample,
    lockfile,
    storybookPath,
    bundlerConfigPath,
    lintingConfigPath,
    formattingConfigPath,
    testingConfigPath,
    accessibilityConfigPath,
    frameworkConfigPath,
  ] = await Promise.all([
    readScopedTextFile({
      branch,
      owner,
      paths: repositorySignalConfig.readmePaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.typescriptPaths,
      projectPath,
      reader,
      repository,
    }),
    reader.listDirectoryFiles(owner, repository, branch, repositorySignalConfig.workflowsPath),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.envExamplePaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.lockfilePaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.storybookPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.bundlerConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.lintingConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.formattingConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.testingConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.accessibilityConfigPaths,
      projectPath,
      reader,
      repository,
    }),
    findScopedPath({
      branch,
      owner,
      paths: repositorySignalConfig.frameworkConfigPaths,
      projectPath,
      reader,
      repository,
    }),
  ]);
  const validWorkflowNames = getValidWorkflowNames(workflowNames);
  const scriptSignals = {
    build: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'build',
      useRootFallback: isNestedProject,
    }),
    lint: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'lint',
      useRootFallback: isNestedProject,
    }),
    test: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'test',
      useRootFallback: isNestedProject,
    }),
  } satisfies Record<ScriptName, ScriptSignal>;

  return {
    a11yTooling: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.a11yDependencies,
      projectConfigPath:
        accessibilityConfigPath.scope === 'project' ? accessibilityConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath:
        accessibilityConfigPath.scope === 'root' ? accessibilityConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    bundler: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.bundlerDependencies,
      projectConfigPath: bundlerConfigPath.scope === 'project' ? bundlerConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: bundlerConfigPath.scope === 'root' ? bundlerConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    ci: {
      exists: validWorkflowNames.length > 0,
      scope: validWorkflowNames.length > 0 ? 'github' : null,
      source: getWorkflowSource(validWorkflowNames),
      workflowNames: validWorkflowNames,
    },
    envExample,
    formatting: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.formattingDependencies,
      projectConfigPath:
        formattingConfigPath.scope === 'project' ? formattingConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: formattingConfigPath.scope === 'root' ? formattingConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    frameworks: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.frameworkDependencies,
      projectConfigPath: frameworkConfigPath.scope === 'project' ? frameworkConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: frameworkConfigPath.scope === 'root' ? frameworkConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    isNestedProject,
    linting: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.lintingDependencies,
      projectConfigPath: lintingConfigPath.scope === 'project' ? lintingConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: lintingConfigPath.scope === 'root' ? lintingConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    lockfile: {
      ...lockfile,
      packageManager: getPackageManager(lockfile.path),
    },
    packageJson: createPackageJsonSignal({
      dependencies: projectDependencyNames,
      packageJson: projectPackageJson,
      path: packageJsonPath,
      scripts: scriptSignals,
      scope: 'project',
    }),
    projectPath,
    readme: {
      ...readmeFile,
      ...createPathSignal(readmeFile?.path ?? null, readmeFile?.scope ?? null),
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
    rootPackageJson: createPackageJsonSignal({
      dependencies: rootDependencyNames,
      packageJson: rootPackage,
      path: isNestedProject && rootPackage ? 'package.json' : packageJsonPath,
      scripts: {
        build: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'build',
        }),
        lint: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'lint',
        }),
        test: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'test',
        }),
      },
      scope: isNestedProject ? 'root' : 'project',
    }),
    storybook: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.storybookDependencies,
      projectConfigPath: storybookPath.scope === 'project' ? storybookPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: storybookPath.scope === 'root' ? storybookPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    testingLibrary: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.testingDependencies,
      projectConfigPath: testingConfigPath.scope === 'project' ? testingConfigPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: testingConfigPath.scope === 'root' ? testingConfigPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
    typescript: buildScopedToolSignal({
      expectedDependencyNames: repositorySignalConfig.typescriptDependencies,
      projectConfigPath: typescriptPath.scope === 'project' ? typescriptPath.path : null,
      projectDependencyNames,
      projectDependencySourceMap,
      rootConfigPath: typescriptPath.scope === 'root' ? typescriptPath.path : null,
      rootDependencyNames,
      rootDependencySourceMap,
    }),
  } satisfies RepositorySignals;
};
