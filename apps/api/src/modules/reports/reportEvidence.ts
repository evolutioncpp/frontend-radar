import type { ProjectReport } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignals.js';

export const reportEvidenceIds = [
  'readme',
  'env-example',
  'package-json',
  'test-script',
  'testing-library',
  'github-actions',
  'build-script',
  'lockfile',
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
    description: signals.ci.exists ? undefined : 'No GitHub Actions workflow was found.',
    id: 'github-actions',
    label: 'GitHub Actions workflow',
    source: signals.ci.source ?? '.github/workflows',
    status: signals.ci.exists ? 'found' : 'missing',
  }),
  'lint-script': getScriptEvidence({
    id: 'lint-script',
    label: 'Lint script',
    missingDescription: 'package.json does not expose a lint script.',
    script: signals.packageJson.scripts.lint,
  }),
  lockfile: createEvidence({
    description: signals.lockfile.exists ? undefined : 'No package lockfile was found.',
    id: 'lockfile',
    label: 'Package lockfile',
    source: signals.lockfile.path ?? 'lockfile',
    status: signals.lockfile.exists ? 'found' : 'missing',
  }),
  'package-json': createEvidence({
    description: signals.packageJson.exists ? undefined : 'package.json was not found.',
    id: 'package-json',
    label: 'package.json',
    source: signals.packageJson.path ?? 'package.json',
    status: signals.packageJson.exists ? 'found' : 'missing',
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
