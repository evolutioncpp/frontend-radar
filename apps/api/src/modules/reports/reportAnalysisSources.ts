import { evidenceSourceConfig } from './reportAnalysisConfig.js';

import type { ProjectReport } from './reportSchemas.js';
import type { PathSignal, RepositorySignals, ScriptSignal, ToolSignal } from './reportSignals.js';

type AnalysisSource = ProjectReport['analysisSources'][number];

export const reportAnalysisSourceIds = [
  'github-repository-metadata',
  'project-package-json',
  'root-package-json',
  'readme',
  'env-example',
  'lockfile',
  'github-actions',
  'build-script',
  'test-script',
  'lint-script',
  'typescript',
  'storybook',
  'frameworks',
  'bundler',
  'testing',
  'linting',
  'formatting',
  'accessibility',
] as const;

const getScope = (scope: AnalysisSource['scope'] | null | undefined) => scope ?? 'project';

const compactSources = (sources: readonly string[]) => {
  if (sources.length <= evidenceSourceConfig.workflowPreviewLimit) {
    return sources.join(', ');
  }

  const visibleSources = sources.slice(0, evidenceSourceConfig.workflowPreviewLimit);
  const hiddenSourceCount = sources.length - visibleSources.length;

  return `${visibleSources.join(', ')}, +${hiddenSourceCount} more`;
};

const createSource = ({
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

const sourceFromPathSignal = ({
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

const sourceFromScript = ({
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

const sourceFromTool = ({
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
    source: compactSources(signal.sources),
    status: signal.found ? (projectSources.length > 0 ? 'found' : 'warning') : 'missing',
  });
};

export const buildReportAnalysisSources = (signals: RepositorySignals): AnalysisSource[] => {
  const sources: AnalysisSource[] = [
    createSource({
      id: 'github-repository-metadata',
      kind: 'github_api',
      label: 'GitHub repository metadata',
      scope: 'github',
      source: 'GET /repos/{owner}/{repo}',
      status: 'found',
    }),
    createSource({
      description: signals.packageJson.exists ? undefined : 'Selected package.json was not found.',
      id: 'project-package-json',
      kind: 'package_json',
      label: 'Selected package.json',
      scope: 'project',
      source: signals.packageJson.path,
      status: signals.packageJson.exists ? 'found' : 'missing',
    }),
    sourceFromPathSignal({
      id: 'readme',
      label: 'README',
      missingDescription: 'README file was not found.',
      signal: signals.readme,
    }),
    sourceFromPathSignal({
      id: 'env-example',
      label: 'Environment example',
      missingDescription: 'Environment example file was not found.',
      signal: signals.envExample,
    }),
    sourceFromPathSignal({
      id: 'lockfile',
      label: 'Package lockfile',
      missingDescription: 'Package lockfile was not found.',
      signal: signals.lockfile,
    }),
    createSource({
      description: signals.ci.exists ? undefined : 'GitHub Actions workflows were not found.',
      id: 'github-actions',
      kind: 'workflow',
      label: 'GitHub Actions workflows',
      scope: 'github',
      source: signals.ci.source,
      status: signals.ci.exists ? 'found' : 'missing',
    }),
    sourceFromScript({
      id: 'build-script',
      label: 'Build script',
      script: signals.packageJson.scripts.build,
    }),
    sourceFromScript({
      id: 'test-script',
      label: 'Test script',
      script: signals.packageJson.scripts.test,
    }),
    sourceFromScript({
      id: 'lint-script',
      label: 'Lint script',
      script: signals.packageJson.scripts.lint,
    }),
    sourceFromTool({
      id: 'typescript',
      label: 'TypeScript',
      signal: signals.typescript,
    }),
    sourceFromTool({
      id: 'storybook',
      label: 'Storybook',
      signal: signals.storybook,
    }),
    sourceFromTool({
      id: 'frameworks',
      label: 'Frontend frameworks',
      signal: signals.frameworks,
    }),
    sourceFromTool({
      id: 'bundler',
      label: 'Frontend bundler',
      signal: signals.bundler,
    }),
    sourceFromTool({
      id: 'testing',
      label: 'Testing tooling',
      signal: signals.testingLibrary,
    }),
    sourceFromTool({
      id: 'linting',
      label: 'Linting tooling',
      signal: signals.linting,
    }),
    sourceFromTool({
      id: 'formatting',
      label: 'Formatting tooling',
      signal: signals.formatting,
    }),
    sourceFromTool({
      id: 'accessibility',
      label: 'Accessibility tooling',
      signal: signals.a11yTooling,
    }),
  ];

  if (signals.isNestedProject) {
    sources.splice(
      2,
      0,
      createSource({
        description: signals.rootPackageJson.exists
          ? undefined
          : 'Root package.json was not found for this monorepo project.',
        id: 'root-package-json',
        kind: 'package_json',
        label: 'Root package.json',
        scope: 'root',
        source: signals.rootPackageJson.path,
        status: signals.rootPackageJson.exists ? 'found' : 'missing',
      }),
    );
  }

  return sources;
};
