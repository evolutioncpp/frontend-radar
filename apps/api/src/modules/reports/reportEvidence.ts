import { evidenceSourceConfig } from './reportAnalysisConfig.js';

import type { ProjectReport } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignals.js';

export const reportEvidenceIds = [
  'readme',
  'env-example',
  'package-json',
  'test-script',
  'testing-library',
  'github-actions',
  'ci-pr-trigger',
  'ci-install-step',
  'ci-lint-step',
  'ci-test-step',
  'ci-build-step',
  'ci-project-scope',
  'build-script',
  'lockfile',
  'lockfile-consistency',
  'package-manager',
  'dependency-hygiene',
  'typescript',
  'lint-script',
  'storybook',
  'bundler',
  'a11y-tooling',
] as const;

export type ReportEvidenceId = (typeof reportEvidenceIds)[number];
export type ReportEvidence = ProjectReport['scoreBreakdown'][number]['evidence'][number];
export type ReportEvidenceMap = Record<ReportEvidenceId, ReportEvidence>;

const createEvidence = ({
  description,
  id,
  label,
  source,
  status,
}: {
  description?: string;
  id: ReportEvidenceId;
  label: string;
  source?: string | null;
  status: ReportEvidence['status'];
}): ReportEvidence => ({
  id,
  label,
  status,
  ...(description ? { description } : {}),
  ...(source ? { source } : {}),
});

const getToolSource = (sources: readonly string[], fallback: string) => {
  return sources.length > 0 ? sources.join(', ') : fallback;
};

const uniqueStrings = (values: readonly string[]) => [...new Set(values)];

const compactSources = (sources: readonly string[]) => {
  const uniqueSources = uniqueStrings(sources);

  if (uniqueSources.length <= evidenceSourceConfig.workflowPreviewLimit) {
    return uniqueSources.join(', ');
  }

  const visibleSources = uniqueSources.slice(0, evidenceSourceConfig.workflowPreviewLimit);
  const hiddenSourceCount = uniqueSources.length - visibleSources.length;

  return `${visibleSources.join(', ')}, +${hiddenSourceCount} more`;
};

const getToolEvidenceStatus = (
  signal: RepositorySignals['typescript'],
): ReportEvidence['status'] => {
  if (!signal.found) {
    return 'missing';
  }

  return (signal.projectSources?.length ?? 0) > 0 ? 'found' : 'warning';
};

const getToolMissingDescription = ({
  foundDescription,
  missingDescription,
  signal,
}: {
  foundDescription?: string;
  missingDescription: string;
  signal: RepositorySignals['typescript'];
}) => {
  if (!signal.found) {
    return missingDescription;
  }

  if ((signal.projectSources?.length ?? 0) === 0) {
    return foundDescription ?? 'Only root-level monorepo signal was found for this project.';
  }

  return undefined;
};

const getReadmeEvidence = (signals: RepositorySignals): ReportEvidence => {
  if (!signals.readme.exists) {
    return createEvidence({
      description: 'README file was not found.',
      id: 'readme',
      label: 'README',
      source: 'README',
      status: 'missing',
    });
  }

  if (
    !signals.readme.isSubstantial ||
    !signals.readme.hasUsageSection ||
    !signals.readme.hasInstallSection
  ) {
    return createEvidence({
      description: 'README was found, but it is short or misses setup and usage details.',
      id: 'readme',
      label: 'README',
      source: signals.readme.path,
      status: 'warning',
    });
  }

  if (signals.readme.scope === 'root' && signals.isNestedProject) {
    return createEvidence({
      description: 'Only a root README was found for this nested frontend project.',
      id: 'readme',
      label: 'README',
      source: signals.readme.path,
      status: 'warning',
    });
  }

  return createEvidence({
    id: 'readme',
    label: 'README',
    source: signals.readme.path,
    status: 'found',
  });
};

const getScriptEvidence = ({
  id,
  label,
  missingDescription,
  script,
}: {
  id: ReportEvidenceId;
  label: string;
  missingDescription: string;
  script: RepositorySignals['packageJson']['scripts']['build'];
}): ReportEvidence => {
  const isRootFallback = script.exists && script.scope === 'root';

  return {
    id,
    label,
    status: script.exists ? (isRootFallback ? 'warning' : 'found') : 'missing',
    ...(script.exists
      ? isRootFallback
        ? { description: 'Only a root-level monorepo script was found.' }
        : {}
      : { description: missingDescription }),
    source: script.source ?? `package.json scripts.${script.name}`,
  };
};

const getCiEvidence = ({
  foundDescription,
  id,
  label,
  missingDescription,
  signals,
  sources,
}: {
  foundDescription: string;
  id: ReportEvidenceId;
  label: string;
  missingDescription: string;
  signals: RepositorySignals;
  sources: readonly string[];
}): ReportEvidence => {
  if (!signals.ci.exists) {
    return createEvidence({
      description: 'No GitHub Actions workflow was found.',
      id,
      label,
      source: '.github/workflows',
      status: 'missing',
    });
  }

  return createEvidence({
    description: sources.length > 0 ? foundDescription : missingDescription,
    id,
    label,
    source: compactSources(sources) || signals.ci.source,
    status: sources.length > 0 ? 'found' : 'warning',
  });
};

export const buildReportEvidenceMap = (signals: RepositorySignals): ReportEvidenceMap => ({
  'a11y-tooling': createEvidence({
    description: getToolMissingDescription({
      foundDescription: 'Only root-level accessibility tooling was found for this project.',
      missingDescription: 'No accessibility-focused dependency was found.',
      signal: signals.a11yTooling,
    }),
    id: 'a11y-tooling',
    label: 'Accessibility tooling',
    source: getToolSource(signals.a11yTooling.sources, 'package.json'),
    status: getToolEvidenceStatus(signals.a11yTooling),
  }),
  'build-script': getScriptEvidence({
    id: 'build-script',
    label: 'Build script',
    missingDescription: 'package.json does not expose a build script.',
    script: signals.packageJson.scripts.build,
  }),
  bundler: createEvidence({
    description: getToolMissingDescription({
      foundDescription: 'Only root-level bundler dependency was found for this project.',
      missingDescription: 'No common frontend bundler dependency was found.',
      signal: signals.bundler,
    }),
    id: 'bundler',
    label: 'Frontend bundler',
    source: getToolSource(signals.bundler.sources, 'package.json'),
    status: getToolEvidenceStatus(signals.bundler),
  }),
  'env-example': createEvidence({
    description: signals.envExample.exists
      ? signals.envExample.scope === 'root' && signals.isNestedProject
        ? 'Only a root environment example was found for this nested project.'
        : undefined
      : 'No environment example file was found.',
    id: 'env-example',
    label: 'Environment example',
    source: signals.envExample.path ?? '.env.example',
    status:
      signals.envExample.exists && signals.envExample.scope === 'root' && signals.isNestedProject
        ? 'warning'
        : signals.envExample.exists
          ? 'found'
          : 'missing',
  }),
  'github-actions': createEvidence({
    description: signals.ci.exists
      ? signals.ciAnalysis.analyzedWorkflowPaths.length === 0
        ? 'Workflow files were found, but their contents could not be analyzed.'
        : signals.ciAnalysis.isWorkflowAnalysisTruncated
          ? 'Only the highest-priority workflow files were analyzed.'
          : undefined
      : 'No GitHub Actions workflow was found.',
    id: 'github-actions',
    label: 'GitHub Actions workflow',
    source: signals.ci.source ?? '.github/workflows',
    status: signals.ci.exists
      ? signals.ciAnalysis.analyzedWorkflowPaths.length === 0
        ? 'warning'
        : signals.ciAnalysis.isWorkflowAnalysisTruncated
          ? 'warning'
          : 'found'
      : 'missing',
  }),
  'ci-build-step': getCiEvidence({
    foundDescription: 'GitHub Actions runs the build step.',
    id: 'ci-build-step',
    label: 'CI build step',
    missingDescription: 'No build step was detected in analyzed workflows.',
    signals,
    sources: signals.ciAnalysis.build.sources,
  }),
  'ci-install-step': getCiEvidence({
    foundDescription: 'GitHub Actions installs dependencies.',
    id: 'ci-install-step',
    label: 'CI install step',
    missingDescription: 'No dependency installation step was detected in analyzed workflows.',
    signals,
    sources: signals.ciAnalysis.install.sources,
  }),
  'ci-lint-step': getCiEvidence({
    foundDescription: 'GitHub Actions runs linting.',
    id: 'ci-lint-step',
    label: 'CI lint step',
    missingDescription: 'No lint step was detected in analyzed workflows.',
    signals,
    sources: signals.ciAnalysis.lint.sources,
  }),
  'ci-pr-trigger': getCiEvidence({
    foundDescription: 'GitHub Actions runs on pull requests.',
    id: 'ci-pr-trigger',
    label: 'Pull request CI trigger',
    missingDescription: 'No pull request trigger was detected in analyzed workflows.',
    signals,
    sources: signals.ciAnalysis.pullRequest.sources,
  }),
  'ci-project-scope': createEvidence({
    description: !signals.ci.exists
      ? 'No GitHub Actions workflow was found.'
      : signals.projectPath && !signals.ciAnalysis.projectScope.found
        ? 'Analyzed workflows do not clearly target the selected frontend path.'
        : undefined,
    id: 'ci-project-scope',
    label: 'CI project scope',
    source: compactSources(signals.ciAnalysis.projectScope.sources) || signals.projectPath,
    status: !signals.ci.exists
      ? 'missing'
      : signals.projectPath && !signals.ciAnalysis.projectScope.found
        ? 'warning'
        : 'found',
  }),
  'ci-test-step': getCiEvidence({
    foundDescription: 'GitHub Actions runs tests.',
    id: 'ci-test-step',
    label: 'CI test step',
    missingDescription: 'No test step was detected in analyzed workflows.',
    signals,
    sources: signals.ciAnalysis.test.sources,
  }),
  'lint-script': getScriptEvidence({
    id: 'lint-script',
    label: 'Lint script',
    missingDescription: 'package.json does not expose a lint script.',
    script: signals.packageJson.scripts.lint,
  }),
  lockfile: createEvidence({
    description: signals.lockfile.exists
      ? signals.lockfile.scope === 'root' && signals.isNestedProject
        ? 'Only a root-level package lockfile was found.'
        : undefined
      : 'No package lockfile was found.',
    id: 'lockfile',
    label: 'Package lockfile',
    source: signals.lockfile.path ?? 'lockfile',
    status:
      signals.lockfile.exists && signals.lockfile.scope === 'root' && signals.isNestedProject
        ? 'warning'
        : signals.lockfile.exists
          ? 'found'
          : 'missing',
  }),
  'lockfile-consistency': createEvidence({
    description: signals.dependencyHealth.hasMixedLockfiles
      ? 'Multiple package manager lockfiles were found.'
      : signals.lockfile.exists
        ? 'Lockfiles point to one package manager.'
        : 'No package lockfile was found.',
    id: 'lockfile-consistency',
    label: 'Lockfile consistency',
    source: compactSources(signals.dependencyHealth.lockfiles.map((lockfile) => lockfile.path)),
    status: signals.dependencyHealth.hasMixedLockfiles
      ? 'warning'
      : signals.lockfile.exists
        ? 'found'
        : 'missing',
  }),
  'package-manager': createEvidence({
    description: signals.dependencyHealth.packageManagerMismatch
      ? 'package.json packageManager does not match the detected lockfile.'
      : signals.dependencyHealth.primaryPackageManager
        ? 'Package manager was detected from lockfile or package metadata.'
        : 'Package manager was not detected.',
    id: 'package-manager',
    label: 'Package manager',
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
  'package-json': createEvidence({
    description: signals.packageJson.exists ? undefined : 'package.json was not found.',
    id: 'package-json',
    label: 'package.json',
    source: signals.packageJson.path ?? 'package.json',
    status: signals.packageJson.exists ? 'found' : 'missing',
  }),
  'dependency-hygiene': createEvidence({
    description:
      signals.dependencyHealth.misplacedDevDependencySources.length > 0
        ? 'Dev-only tooling dependencies were found in production dependencies.'
        : 'No dev-only tooling dependencies were found in production dependencies.',
    id: 'dependency-hygiene',
    label: 'Dependency hygiene',
    source: compactSources(signals.dependencyHealth.misplacedDevDependencySources),
    status: signals.dependencyHealth.misplacedDevDependencySources.length > 0 ? 'warning' : 'found',
  }),
  readme: getReadmeEvidence(signals),
  storybook: createEvidence({
    description: getToolMissingDescription({
      foundDescription: 'Only root-level Storybook signal was found for this project.',
      missingDescription: 'Storybook configuration or dependency was not found.',
      signal: signals.storybook,
    }),
    id: 'storybook',
    label: 'Storybook',
    source: getToolSource(signals.storybook.sources, '.storybook / package.json'),
    status: getToolEvidenceStatus(signals.storybook),
  }),
  'test-script': getScriptEvidence({
    id: 'test-script',
    label: 'Test script',
    missingDescription: 'package.json does not expose a test script.',
    script: signals.packageJson.scripts.test,
  }),
  'testing-library': createEvidence({
    description: getToolMissingDescription({
      foundDescription: 'Only root-level testing dependency was found for this project.',
      missingDescription: 'No common frontend testing dependency was found.',
      signal: signals.testingLibrary,
    }),
    id: 'testing-library',
    label: 'Testing Library',
    source: getToolSource(signals.testingLibrary.sources, 'package.json'),
    status: getToolEvidenceStatus(signals.testingLibrary),
  }),
  typescript: createEvidence({
    description: getToolMissingDescription({
      foundDescription: 'Only root-level TypeScript signal was found for this project.',
      missingDescription: 'TypeScript configuration or dependency was not found.',
      signal: signals.typescript,
    }),
    id: 'typescript',
    label: 'TypeScript',
    source: getToolSource(signals.typescript.sources, 'tsconfig.json / package.json'),
    status: getToolEvidenceStatus(signals.typescript),
  }),
});

export const pickReportEvidence = (
  evidenceMap: ReportEvidenceMap,
  ids: readonly ReportEvidenceId[],
) => ids.map((id) => evidenceMap[id]);
