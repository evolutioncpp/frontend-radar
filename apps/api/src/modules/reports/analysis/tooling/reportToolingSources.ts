import type { ToolingSource, ToolingSourceSection } from '../../domain/reportSignalContracts.js';

export type { ToolingSource, ToolingSourceSection };

const getFileLabel = (path: string) => {
  const segments = path.split('/');

  return segments[segments.length - 1] || path;
};

export const createFileSource = (path: string): ToolingSource => ({
  raw: path,
  kind: 'file',
  label: getFileLabel(path),
  path,
  detail: path,
});

export const createDependencySource = ({
  name,
  packageJsonPath,
  section,
}: {
  name: string;
  packageJsonPath: string;
  section: Exclude<ToolingSourceSection, 'scripts'>;
}): ToolingSource => ({
  raw: `${packageJsonPath} ${section}.${name}`,
  kind: 'dependency',
  label: name,
  path: packageJsonPath,
  section,
  name,
  detail: `${packageJsonPath} / ${section}`,
});

export const createScriptSource = ({
  name,
  packageJsonPath,
}: {
  name: string;
  packageJsonPath: string;
}): ToolingSource => ({
  raw: `${packageJsonPath} scripts.${name}`,
  kind: 'script',
  label: `scripts.${name}`,
  path: packageJsonPath,
  section: 'scripts',
  name,
  detail: packageJsonPath,
});

export const createWorkflowSource = (path: string): ToolingSource => ({
  raw: path,
  kind: 'workflow',
  label: getFileLabel(path),
  path,
  name: getFileLabel(path),
  detail: '.github/workflows',
});

export const createGithubApiSource = (raw: string): ToolingSource => ({
  raw,
  kind: 'github_api',
  label: raw,
});

export const createDependencyNameSource = (name: string): ToolingSource => ({
  raw: name,
  kind: 'dependency',
  label: name,
  name,
});

export const uniqueToolingSources = (sources: readonly ToolingSource[]) => {
  const seenSources = new Set<string>();

  return sources.filter((source) => {
    if (seenSources.has(source.raw)) {
      return false;
    }

    seenSources.add(source.raw);

    return true;
  });
};
