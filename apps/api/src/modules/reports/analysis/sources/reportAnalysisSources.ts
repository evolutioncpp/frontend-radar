import { sourcePreviewConfig } from '../../domain/reportAnalysisConfig.js';
import { reportAnalysisSourceIds } from '../../domain/reportSignalContracts.js';

import type { ProjectReport } from '../../domain/reportSchemas.js';
import type {
  PathSignal,
  RepositorySignals,
  ScriptSignal,
  ToolSignal,
} from '../../domain/reportSignalContracts.js';

type AnalysisSource = ProjectReport['analysisSources'][number];

const getScope = (scope: AnalysisSource['scope'] | null | undefined) => scope ?? 'project';

const uniqueStrings = (values: readonly string[]) => [...new Set(values)];

const compactSources = (sources: readonly string[]) => {
  const uniqueSources = uniqueStrings(sources);

  if (uniqueSources.length <= sourcePreviewConfig.workflowPreviewLimit) {
    return uniqueSources.join(', ');
  }

  const visibleSources = uniqueSources.slice(0, sourcePreviewConfig.workflowPreviewLimit);
  const hiddenSourceCount = uniqueSources.length - visibleSources.length;

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
    source: compactSources(signal.sources.map((source) => source.raw)),
    status: signal.found ? (projectSources.length > 0 ? 'found' : 'warning') : 'missing',
  });
};

const sourceFromCiCheck = ({
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

export const buildReportAnalysisSources = (
  signals: RepositorySignals,
  repository?: { name: string; owner: string },
): AnalysisSource[] => {
  const sources: AnalysisSource[] = [
    createSource({
      id: 'github-repository-metadata',
      kind: 'github_api',
      label: 'GitHub repository metadata',
      scope: 'github',
      source: repository ? `GET /repos/${repository.owner}/${repository.name}` : 'GitHub REST API',
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
      description: signals.dependencyHealth.hasMixedLockfiles
        ? 'Multiple package manager lockfiles were found.'
        : 'Lockfile set matches one package manager.',
      id: 'lockfile-consistency',
      kind: 'file',
      label: 'Lockfile consistency',
      scope: signals.lockfile.scope ?? 'project',
      source: compactSources(signals.dependencyHealth.lockfiles.map((lockfile) => lockfile.path)),
      status: signals.dependencyHealth.hasMixedLockfiles
        ? 'warning'
        : signals.lockfile.exists
          ? 'found'
          : 'missing',
    }),
    createSource({
      description: signals.dependencyHealth.packageManagerMismatch
        ? 'package.json packageManager does not match the detected lockfile.'
        : signals.dependencyHealth.primaryPackageManager
          ? 'Package manager was inferred from lockfile/package metadata.'
          : 'Package manager was not detected.',
      id: 'package-manager',
      kind: 'package_json',
      label: 'Package manager',
      scope: signals.packageJson.scope ?? 'project',
      source:
        signals.dependencyHealth.declaredPackageManagerSource ??
        signals.lockfile.path ??
        signals.packageJson.path,
      status: signals.dependencyHealth.packageManagerMismatch
        ? 'warning'
        : signals.dependencyHealth.primaryPackageManager
          ? 'found'
          : 'missing',
    }),
    createSource({
      description:
        signals.dependencyHealth.misplacedDevDependencySources.length > 0
          ? 'Dev-only tooling dependencies were found in production dependencies.'
          : 'No dev-only tooling dependencies were found in production dependencies.',
      id: 'dependency-hygiene',
      kind: 'dependency',
      label: 'Dependency hygiene',
      scope:
        signals.isNestedProject &&
        signals.dependencyHealth.misplacedDevDependencySources.some((source) =>
          source.startsWith('package.json '),
        )
          ? 'root'
          : 'project',
      source: compactSources(signals.dependencyHealth.misplacedDevDependencySources),
      status:
        signals.dependencyHealth.misplacedDevDependencySources.length > 0 ? 'warning' : 'found',
    }),
    createSource({
      description: !signals.ci.exists
        ? 'GitHub Actions workflows were not found.'
        : signals.ciAnalysis.isWorkflowAnalysisTruncated
          ? 'Only the highest-priority workflow files were analyzed.'
          : undefined,
      id: 'github-actions',
      kind: 'workflow',
      label: 'GitHub Actions workflows',
      scope: 'github',
      source: signals.ci.source,
      status: signals.ci.exists
        ? signals.ciAnalysis.isWorkflowAnalysisTruncated
          ? 'warning'
          : 'found'
        : 'missing',
    }),
    sourceFromCiCheck({
      foundDescription: 'GitHub Actions runs on pull requests.',
      id: 'ci-pr-trigger',
      label: 'Pull request CI trigger',
      missingDescription: 'Pull request trigger was not detected in analyzed workflows.',
      sources: signals.ciAnalysis.pullRequest.sources,
    }),
    sourceFromCiCheck({
      foundDescription: 'Dependency installation step was detected in GitHub Actions.',
      id: 'ci-install-step',
      label: 'CI install step',
      missingDescription: 'Dependency installation step was not detected in analyzed workflows.',
      sources: signals.ciAnalysis.install.sources,
    }),
    createSource({
      description:
        signals.ciAnalysis.lint.found &&
        signals.ciAnalysis.test.found &&
        signals.ciAnalysis.build.found
          ? 'Lint, test and build steps were detected in GitHub Actions.'
          : 'One or more lint, test or build steps were not detected in analyzed workflows.',
      id: 'ci-quality-steps',
      kind: 'workflow',
      label: 'CI quality steps',
      scope: 'github',
      source: compactSources([
        ...signals.ciAnalysis.lint.sources,
        ...signals.ciAnalysis.test.sources,
        ...signals.ciAnalysis.build.sources,
      ]),
      status: !signals.ci.exists
        ? 'missing'
        : signals.ciAnalysis.lint.found &&
            signals.ciAnalysis.test.found &&
            signals.ciAnalysis.build.found
          ? 'found'
          : 'warning',
    }),
    createSource({
      description:
        signals.projectPath && !signals.ciAnalysis.projectScope.found
          ? 'Analyzed workflows do not clearly target the selected frontend path.'
          : 'Workflow scope matches repository root or selected frontend path.',
      id: 'ci-project-scope',
      kind: 'workflow',
      label: 'CI project scope',
      scope: 'github',
      source: compactSources(signals.ciAnalysis.projectScope.sources),
      status: !signals.ci.exists
        ? 'missing'
        : signals.projectPath && !signals.ciAnalysis.projectScope.found
          ? 'warning'
          : 'found',
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
    createSource({
      description: signals.sourceCode.files.isTruncated
        ? 'Only a bounded subset of source files was analyzed.'
        : `${signals.sourceCode.files.count} source file(s) were analyzed.`,
      id: 'source-files',
      kind: 'file',
      label: 'Source files',
      scope: 'project',
      source: compactSources(signals.sourceCode.files.sources),
      status:
        signals.sourceCode.files.count > 0
          ? signals.sourceCode.files.isTruncated
            ? 'warning'
            : 'found'
          : 'missing',
    }),
    createSource({
      description:
        signals.testQuality.files.count > 0
          ? `${signals.testQuality.files.count} test file(s) were found.`
          : 'No test or spec files were found in the selected frontend path.',
      id: 'test-files',
      kind: 'file',
      label: 'Test files',
      scope: 'project',
      source: compactSources(signals.testQuality.files.sources),
      status: signals.testQuality.files.count > 0 ? 'found' : 'missing',
    }),
    createSource({
      description: !signals.testQuality.coverage.found
        ? 'No coverage script or coverage configuration was detected.'
        : signals.testQuality.coverage.scope === 'root'
          ? 'Only a root-level coverage script or coverage configuration was detected.'
          : 'A coverage script or coverage configuration was detected.',
      id: 'test-coverage',
      kind: 'script',
      label: 'Coverage signal',
      scope: signals.testQuality.coverage.scope ?? 'project',
      source: compactSources(signals.testQuality.coverage.sources),
      status: signals.testQuality.coverage.found
        ? signals.testQuality.coverage.scope === 'root'
          ? 'warning'
          : 'found'
        : 'missing',
    }),
    sourceFromTool({
      id: 'typescript',
      label: 'TypeScript',
      signal: signals.typescript,
    }),
    createSource({
      description: signals.typescriptQuality.config.exists
        ? signals.typescriptQuality.config.hasMissingConfig
          ? 'TypeScript configuration was found, but a referenced or extended config is missing.'
          : signals.typescriptQuality.config.hasParseError
            ? 'TypeScript configuration was found, but at least one config could not be parsed.'
            : 'TypeScript configuration was found.'
        : 'TypeScript configuration was not found.',
      id: 'typescript-config',
      kind: 'file',
      label: 'TypeScript config',
      scope: signals.typescriptQuality.config.scope ?? 'project',
      source: compactSources(
        (signals.typescriptQuality.config.configPaths ?? []).length > 0
          ? (signals.typescriptQuality.config.configPaths ?? [])
          : signals.typescriptQuality.config.path
            ? [signals.typescriptQuality.config.path]
            : [],
      ),
      status: signals.typescriptQuality.config.exists
        ? signals.typescriptQuality.config.hasMissingConfig ||
          signals.typescriptQuality.config.hasParseError
          ? 'warning'
          : 'found'
        : 'missing',
    }),
    createSource({
      description: signals.typescriptQuality.typecheck.exists
        ? 'package.json exposes a dedicated typecheck script.'
        : 'package.json does not expose a dedicated typecheck script.',
      id: 'typecheck-script',
      kind: 'script',
      label: 'Typecheck script',
      scope: signals.typescriptQuality.typecheck.scope ?? 'project',
      source: signals.typescriptQuality.typecheck.source,
      status: signals.typescriptQuality.typecheck.exists ? 'found' : 'missing',
    }),
    createSource({
      description:
        signals.sourceCode.codeHealth.issueCount > 0
          ? `${signals.sourceCode.codeHealth.issueCount} source-level maintainability warning(s) were detected.`
          : 'No obvious debug, TODO, eslint-disable or explicit any hotspots were detected.',
      id: 'code-health',
      kind: 'file',
      label: 'Source health',
      scope: 'project',
      source: compactSources(signals.sourceCode.codeHealth.sources),
      status:
        signals.sourceCode.files.count === 0
          ? 'missing'
          : signals.sourceCode.codeHealth.issueCount > 0
            ? 'warning'
            : 'found',
    }),
    createSource({
      description: signals.sourceCode.codeSplitting.found
        ? 'Lazy loading or dynamic imports were detected in source files.'
        : 'No lazy loading or dynamic import signal was detected.',
      id: 'code-splitting',
      kind: 'file',
      label: 'Code splitting',
      scope: 'project',
      source: compactSources(signals.sourceCode.codeSplitting.sources),
      status: signals.sourceCode.codeSplitting.found ? 'found' : 'missing',
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
