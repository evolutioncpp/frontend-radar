import {
  compactSources,
  createSource,
  sourceFromCiCheck,
  type AnalysisSource,
} from './reportAnalysisSourceBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildCiSources = (signals: RepositorySignals): AnalysisSource[] => [
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
];
