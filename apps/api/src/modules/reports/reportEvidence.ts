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
}): ReportEvidence => ({
  id,
  label,
  status: script.exists ? 'found' : 'missing',
  ...(script.exists ? {} : { description: missingDescription }),
  source: script.source ?? `package.json scripts.${script.name}`,
});

export const buildReportEvidenceMap = (signals: RepositorySignals): ReportEvidenceMap => ({
  'a11y-tooling': createEvidence({
    description: signals.a11yTooling.found
      ? undefined
      : 'No accessibility-focused dependency was found.',
    id: 'a11y-tooling',
    label: 'Accessibility tooling',
    source: getToolSource(signals.a11yTooling.sources, 'package.json'),
    status: signals.a11yTooling.found ? 'found' : 'missing',
  }),
  'build-script': getScriptEvidence({
    id: 'build-script',
    label: 'Build script',
    missingDescription: 'package.json does not expose a build script.',
    script: signals.packageJson.scripts.build,
  }),
  bundler: createEvidence({
    description: signals.bundler.found
      ? undefined
      : 'No common frontend bundler dependency was found.',
    id: 'bundler',
    label: 'Frontend bundler',
    source: getToolSource(signals.bundler.sources, 'package.json'),
    status: signals.bundler.found ? 'found' : 'missing',
  }),
  'env-example': createEvidence({
    description: signals.envExample.exists ? undefined : 'No environment example file was found.',
    id: 'env-example',
    label: 'Environment example',
    source: signals.envExample.path ?? '.env.example',
    status: signals.envExample.exists ? 'found' : 'missing',
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
    source: 'package.json',
    status: signals.packageJson.exists ? 'found' : 'missing',
  }),
  readme: getReadmeEvidence(signals),
  storybook: createEvidence({
    description: signals.storybook.found
      ? undefined
      : 'Storybook configuration or dependency was not found.',
    id: 'storybook',
    label: 'Storybook',
    source: getToolSource(signals.storybook.sources, '.storybook / package.json'),
    status: signals.storybook.found ? 'found' : 'missing',
  }),
  'test-script': getScriptEvidence({
    id: 'test-script',
    label: 'Test script',
    missingDescription: 'package.json does not expose a test script.',
    script: signals.packageJson.scripts.test,
  }),
  'testing-library': createEvidence({
    description: signals.testingLibrary.found
      ? undefined
      : 'No common frontend testing dependency was found.',
    id: 'testing-library',
    label: 'Testing Library',
    source: getToolSource(signals.testingLibrary.sources, 'package.json'),
    status: signals.testingLibrary.found ? 'found' : 'missing',
  }),
  typescript: createEvidence({
    description: signals.typescript.found
      ? undefined
      : 'TypeScript configuration or dependency was not found.',
    id: 'typescript',
    label: 'TypeScript',
    source: getToolSource(signals.typescript.sources, 'tsconfig.json / package.json'),
    status: signals.typescript.found ? 'found' : 'missing',
  }),
});

export const pickReportEvidence = (
  evidenceMap: ReportEvidenceMap,
  ids: readonly ReportEvidenceId[],
) => ids.map((id) => evidenceMap[id]);
