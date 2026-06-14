import { sourcePreviewConfig } from '../../domain/reportAnalysisConfig.js';
import { reportAnalysisSourceIds } from '../../domain/reportSignalContracts.js';

import type { ProjectReport } from '../../domain/reportSchemas.js';
import type { PathSignal, ScriptSignal, ToolSignal } from '../../domain/reportSignalContracts.js';

export type AnalysisSource = ProjectReport['analysisSources'][number];

const getScope = (scope: AnalysisSource['scope'] | null | undefined) => scope ?? 'project';

const uniqueStrings = (values: readonly string[]) => [...new Set(values)];

export const compactSources = (sources: readonly string[]) => {
  const uniqueSources = uniqueStrings(sources);

  if (uniqueSources.length <= sourcePreviewConfig.workflowPreviewLimit) {
    return uniqueSources.join(', ');
  }

  const visibleSources = uniqueSources.slice(0, sourcePreviewConfig.workflowPreviewLimit);
  const hiddenSourceCount = uniqueSources.length - visibleSources.length;

  return `${visibleSources.join(', ')}, +${hiddenSourceCount} more`;
};

export const createSource = ({
  description,
  id,
  kind,
  label,
  scope,
  source,
  status,
}: {
  description?: string;
  id: (typeof reportAnalysisSourceIds)[number];
  kind: AnalysisSource['kind'];
  label: string;
  scope: AnalysisSource['scope'];
  source?: string | null;
  status: AnalysisSource['status'];
}): AnalysisSource => ({
  id,
  kind,
  label,
  scope,
  status,
  ...(description ? { description } : {}),
  ...(source ? { source } : {}),
});

export const sourceFromPathSignal = ({
  id,
  kind = 'file',
  label,
  missingDescription,
  signal,
}: {
  id: (typeof reportAnalysisSourceIds)[number];
  kind?: AnalysisSource['kind'];
  label: string;
  missingDescription: string;
  signal: PathSignal;
}) =>
  createSource({
    description: signal.exists ? undefined : missingDescription,
    id,
    kind,
    label,
    scope: getScope(signal.scope),
    source: signal.path,
    status: signal.exists ? (signal.scope === 'root' ? 'warning' : 'found') : 'missing',
  });

export const sourceFromScript = ({
  id,
  label,
  script,
}: {
  id: (typeof reportAnalysisSourceIds)[number];
  label: string;
  script: ScriptSignal;
}) =>
  createSource({
    description: script.exists ? undefined : `package.json scripts.${script.name} was not found.`,
    id,
    kind: 'script',
    label,
    scope: getScope(script.scope),
    source: script.source,
    status: script.exists ? (script.scope === 'root' ? 'warning' : 'found') : 'missing',
  });

export const sourceFromTool = ({
  id,
  label,
  signal,
}: {
  id: (typeof reportAnalysisSourceIds)[number];
  label: string;
  signal: ToolSignal;
}) => {
  const projectSources = signal.projectSources ?? [];
  const rootSources = signal.rootSources ?? [];
  const kind = signal.configPaths.length > 0 ? 'file' : 'dependency';

  return createSource({
    description: signal.found ? undefined : `${label} was not detected.`,
    id,
    kind,
    label,
    scope: projectSources.length > 0 ? 'project' : rootSources.length > 0 ? 'root' : 'project',
    source: compactSources(signal.sources.map((source) => source.raw)),
    status: signal.found ? (projectSources.length > 0 ? 'found' : 'warning') : 'missing',
  });
};

export const sourceFromCiCheck = ({
  foundDescription,
  id,
  label,
  missingDescription,
  sources,
}: {
  foundDescription: string;
  id: (typeof reportAnalysisSourceIds)[number];
  label: string;
  missingDescription: string;
  sources: readonly string[];
}) =>
  createSource({
    description: sources.length > 0 ? foundDescription : missingDescription,
    id,
    kind: 'workflow',
    label,
    scope: 'github',
    source: compactSources(sources),
    status: sources.length > 0 ? 'found' : 'missing',
  });
