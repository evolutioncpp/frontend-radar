import { repositorySignalConfig } from './reportAnalysisConfig.js';

import type { GithubRepositoryReader, PackageJson } from './githubRepositoryReader.js';

export interface RepositorySignals {
  hasA11yTooling: boolean;
  hasBuildScript: boolean;
  hasBundler: boolean;
  hasCi: boolean;
  hasEnvExample: boolean;
  hasLintScript: boolean;
  hasLockfile: boolean;
  hasPackageJson: boolean;
  hasReadme: boolean;
  hasStorybook: boolean;
  hasTestScript: boolean;
  hasTestingLibrary: boolean;
  hasTypescript: boolean;
}

const hasScript = (packageJson: PackageJson | null, scriptName: string) => {
  return typeof packageJson?.scripts?.[scriptName] === 'string';
};

const hasDependency = (packageJson: PackageJson | null, dependencyNames: readonly string[]) => {
  const dependencies = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
  };

  return dependencyNames.some((dependencyName) => dependencyName in dependencies);
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
  const [hasReadme, hasTypescriptConfig, hasCi, hasEnvExample, hasLockfile, hasStorybookConfig] =
    await Promise.all([
      reader.hasAnyPath(owner, repository, branch, repositorySignalConfig.readmePaths),
      reader.hasAnyPath(owner, repository, branch, repositorySignalConfig.typescriptPaths),
      reader.hasDirectory(owner, repository, branch, repositorySignalConfig.workflowsPath),
      reader.hasAnyPath(owner, repository, branch, repositorySignalConfig.envExamplePaths),
      reader.hasAnyPath(owner, repository, branch, repositorySignalConfig.lockfilePaths),
      reader.hasAnyPath(owner, repository, branch, repositorySignalConfig.storybookPaths),
    ]);

  const hasStorybook =
    hasStorybookConfig || hasDependency(packageJson, repositorySignalConfig.storybookDependencies);

  return {
    hasA11yTooling: hasDependency(packageJson, repositorySignalConfig.a11yDependencies),
    hasBuildScript: hasScript(packageJson, 'build'),
    hasBundler: hasDependency(packageJson, repositorySignalConfig.bundlerDependencies),
    hasCi,
    hasEnvExample,
    hasLintScript: hasScript(packageJson, 'lint'),
    hasLockfile,
    hasPackageJson: packageJson !== null,
    hasReadme,
    hasStorybook,
    hasTestScript: hasScript(packageJson, 'test'),
    hasTestingLibrary: hasDependency(packageJson, repositorySignalConfig.testingDependencies),
    hasTypescript:
      hasTypescriptConfig ||
      hasDependency(packageJson, repositorySignalConfig.typescriptDependencies),
  } satisfies RepositorySignals;
};
