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
  found,
  id,
  label,
  missingDescription,
  source,
}: {
  found: boolean;
  id: ReportEvidenceId;
  label: string;
  missingDescription: string;
  source: string;
}): ReportEvidence => ({
  id,
  label,
  status: found ? 'found' : 'missing',
  ...(found ? {} : { description: missingDescription }),
  source,
});

export const buildReportEvidenceMap = (signals: RepositorySignals): ReportEvidenceMap => ({
  'a11y-tooling': createEvidence({
    found: signals.hasA11yTooling,
    id: 'a11y-tooling',
    label: 'Accessibility tooling',
    missingDescription: 'No accessibility-focused dependency was found.',
    source: 'package.json',
  }),
  'build-script': createEvidence({
    found: signals.hasBuildScript,
    id: 'build-script',
    label: 'Build script',
    missingDescription: 'package.json does not expose a build script.',
    source: 'package.json scripts.build',
  }),
  bundler: createEvidence({
    found: signals.hasBundler,
    id: 'bundler',
    label: 'Frontend bundler',
    missingDescription: 'No common frontend bundler dependency was found.',
    source: 'package.json',
  }),
  'env-example': createEvidence({
    found: signals.hasEnvExample,
    id: 'env-example',
    label: 'Environment example',
    missingDescription: 'No environment example file was found.',
    source: '.env.example',
  }),
  'github-actions': createEvidence({
    found: signals.hasCi,
    id: 'github-actions',
    label: 'GitHub Actions workflow',
    missingDescription: 'No GitHub Actions workflow was found.',
    source: '.github/workflows',
  }),
  'lint-script': createEvidence({
    found: signals.hasLintScript,
    id: 'lint-script',
    label: 'Lint script',
    missingDescription: 'package.json does not expose a lint script.',
    source: 'package.json scripts.lint',
  }),
  lockfile: createEvidence({
    found: signals.hasLockfile,
    id: 'lockfile',
    label: 'Package lockfile',
    missingDescription: 'No package lockfile was found.',
    source: 'lockfile',
  }),
  'package-json': createEvidence({
    found: signals.hasPackageJson,
    id: 'package-json',
    label: 'package.json',
    missingDescription: 'package.json was not found.',
    source: 'package.json',
  }),
  readme: createEvidence({
    found: signals.hasReadme,
    id: 'readme',
    label: 'README',
    missingDescription: 'README file was not found.',
    source: 'README',
  }),
  storybook: createEvidence({
    found: signals.hasStorybook,
    id: 'storybook',
    label: 'Storybook',
    missingDescription: 'Storybook configuration or dependency was not found.',
    source: '.storybook / package.json',
  }),
  'test-script': createEvidence({
    found: signals.hasTestScript,
    id: 'test-script',
    label: 'Test script',
    missingDescription: 'package.json does not expose a test script.',
    source: 'package.json scripts.test',
  }),
  'testing-library': createEvidence({
    found: signals.hasTestingLibrary,
    id: 'testing-library',
    label: 'Testing Library',
    missingDescription: 'No common frontend testing dependency was found.',
    source: 'package.json',
  }),
  typescript: createEvidence({
    found: signals.hasTypescript,
    id: 'typescript',
    label: 'TypeScript',
    missingDescription: 'TypeScript configuration or dependency was not found.',
    source: 'tsconfig.json / package.json',
  }),
});

export const pickReportEvidence = (
  evidenceMap: ReportEvidenceMap,
  ids: readonly ReportEvidenceId[],
) => ids.map((id) => evidenceMap[id]);
