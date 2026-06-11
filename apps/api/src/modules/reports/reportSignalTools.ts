import type { ToolSignal } from './reportSignalTypes.js';
import {
  createDependencyNameSource,
  createFileSource,
  uniqueToolingSources,
  type ToolingSource,
} from './reportToolingSources.js';

export const uniqueStrings = (values: readonly string[]) => [...new Set(values)];

const getMatchingDependencies = (
  dependencyNames: readonly string[],
  expectedDependencyNames: readonly string[],
) => {
  const dependencies = new Set(dependencyNames);

  return expectedDependencyNames.filter((dependencyName) => dependencies.has(dependencyName));
};

const getDependencySources = (
  dependencyNames: readonly string[],
  dependencySourceMap: ReadonlyMap<string, ToolingSource>,
) => {
  return dependencyNames.map(
    (dependencyName) =>
      dependencySourceMap.get(dependencyName) ?? createDependencyNameSource(dependencyName),
  );
};

export const createToolSignal = ({
  configPaths = [],
  dependencies,
  projectSources = [],
  rootSources = [],
}: {
  configPaths?: string[];
  dependencies: string[];
  projectSources?: ToolingSource[];
  rootSources?: ToolingSource[];
}): ToolSignal => {
  const sources = uniqueToolingSources([...projectSources, ...rootSources]);

  return {
    configPaths,
    dependencies,
    found: sources.length > 0,
    projectSources: uniqueToolingSources(projectSources),
    rootSources: uniqueToolingSources(rootSources),
    sources,
  };
};

export const buildScopedToolSignal = ({
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
  projectDependencySourceMap: ReadonlyMap<string, ToolingSource>;
  rootConfigPath?: string | null;
  rootDependencyNames: readonly string[];
  rootDependencySourceMap: ReadonlyMap<string, ToolingSource>;
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
  const projectSources = uniqueToolingSources([
    ...(projectConfigPath ? [createFileSource(projectConfigPath)] : []),
    ...projectDependencySources,
  ]);
  const rootSources = uniqueToolingSources([
    ...(rootConfigPath ? [createFileSource(rootConfigPath)] : []),
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
