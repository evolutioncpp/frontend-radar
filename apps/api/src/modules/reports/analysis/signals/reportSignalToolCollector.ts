import { repositorySignalConfig } from '../../domain/reportAnalysisConfig.js';
import { buildScopedToolSignal } from './reportSignalTools.js';

import type { PathSignal, RepositorySignals } from './reportSignalTypes.js';
import type { ToolingSource } from '../tooling/reportToolingSources.js';

type DependencySourceMap = ReadonlyMap<string, ToolingSource>;

export const collectRepositoryToolSignals = ({
  accessibilityConfigPath,
  bundlerConfigPath,
  formattingConfigPath,
  frameworkConfigPath,
  lintingConfigPath,
  projectDependencyNames,
  projectDependencySourceMap,
  rootDependencyNames,
  rootDependencySourceMap,
  storybookPath,
  testingConfigPath,
  typescriptPath,
}: {
  accessibilityConfigPath: PathSignal;
  bundlerConfigPath: PathSignal;
  formattingConfigPath: PathSignal;
  frameworkConfigPath: PathSignal;
  lintingConfigPath: PathSignal;
  projectDependencyNames: readonly string[];
  projectDependencySourceMap: DependencySourceMap;
  rootDependencyNames: readonly string[];
  rootDependencySourceMap: DependencySourceMap;
  storybookPath: PathSignal;
  testingConfigPath: PathSignal;
  typescriptPath: PathSignal;
}): Pick<
  RepositorySignals,
  | 'a11yTooling'
  | 'bundler'
  | 'formatting'
  | 'frameworks'
  | 'linting'
  | 'storybook'
  | 'testingLibrary'
  | 'typescript'
> => ({
  a11yTooling: buildScopedToolSignal({
    expectedDependencyNames: repositorySignalConfig.a11yDependencies,
    projectConfigPath:
      accessibilityConfigPath.scope === 'project' ? accessibilityConfigPath.path : null,
    projectDependencyNames,
    projectDependencySourceMap,
    rootConfigPath: accessibilityConfigPath.scope === 'root' ? accessibilityConfigPath.path : null,
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
  formatting: buildScopedToolSignal({
    expectedDependencyNames: repositorySignalConfig.formattingDependencies,
    projectConfigPath: formattingConfigPath.scope === 'project' ? formattingConfigPath.path : null,
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
  linting: buildScopedToolSignal({
    expectedDependencyNames: repositorySignalConfig.lintingDependencies,
    projectConfigPath: lintingConfigPath.scope === 'project' ? lintingConfigPath.path : null,
    projectDependencyNames,
    projectDependencySourceMap,
    rootConfigPath: lintingConfigPath.scope === 'root' ? lintingConfigPath.path : null,
    rootDependencyNames,
    rootDependencySourceMap,
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
});
