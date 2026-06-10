import {
  evidenceSourceConfig,
  readmeQualityConfig,
  repositorySignalConfig,
} from './reportAnalysisConfig.js';

import type { GithubRepositoryReader, PackageJson } from './githubRepositoryReader.js';

type ScriptName = 'build' | 'lint' | 'test';

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

const getMatchingDependencies = (
  dependencyNames: readonly string[],
  expectedDependencyNames: readonly string[],
) => {
  const dependencies = new Set(dependencyNames);

  return expectedDependencyNames.filter((dependencyName) => dependencies.has(dependencyName));
};

const createScriptSignal = (
  packageJson: PackageJson | null,
  scriptName: ScriptName,
): ScriptSignal => {
  const value = getScript(packageJson, scriptName);

  return {
    exists: value !== null,
    name: scriptName,
    source: value ? `package.json scripts.${scriptName}` : null,
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
}: {
  configPaths?: string[];
  dependencies: string[];
}): ToolSignal => {
  const sources = [...configPaths, ...dependencies];

  return {
    configPaths,
    dependencies,
    found: sources.length > 0,
    sources,
  };
};

const hasTextPattern = (content: string, patterns: readonly RegExp[]) => {
  return patterns.some((pattern) => pattern.test(content));
};

const getPackageManager = (lockfilePath: string | null) => {
  switch (lockfilePath) {
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
  reader,
  repository,
}: {
  branch: string;
  owner: string;
  packageJson: PackageJson | null;
  reader: GithubRepositoryReader;
  repository: string;
}) => {
  const [readmeFile, typescriptPath, workflowNames, envExamplePath, lockfilePath, storybookPath] =
    await Promise.all([
      reader.readFirstTextFile(owner, repository, branch, repositorySignalConfig.readmePaths),
      reader.findFirstPath(owner, repository, branch, repositorySignalConfig.typescriptPaths),
      reader.listDirectoryFiles(owner, repository, branch, repositorySignalConfig.workflowsPath),
      reader.findFirstPath(owner, repository, branch, repositorySignalConfig.envExamplePaths),
      reader.findFirstPath(owner, repository, branch, repositorySignalConfig.lockfilePaths),
      reader.findFirstPath(owner, repository, branch, repositorySignalConfig.storybookPaths),
    ]);

  const dependencies = getDependencyNames(packageJson);
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
    }),
    bundler: createToolSignal({
      dependencies: bundlerDependencies,
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
      scripts: {
        build: createScriptSignal(packageJson, 'build'),
        lint: createScriptSignal(packageJson, 'lint'),
        test: createScriptSignal(packageJson, 'test'),
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
    }),
    testingLibrary: createToolSignal({
      dependencies: testingDependencies,
    }),
    typescript: createToolSignal({
      configPaths: typescriptPath ? [typescriptPath] : [],
      dependencies: typescriptDependencies,
    }),
  } satisfies RepositorySignals;
};
