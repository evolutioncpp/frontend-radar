import { scoreThresholds } from './reportAnalysisConfig.js';
import { buildReportEvidenceMap, pickReportEvidence } from './reportEvidence.js';

import type { RepositorySignals } from './reportSignals.js';

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

const getScopedPathScore = (
  signal: Pick<RepositorySignals['readme'], 'exists' | 'scope'>,
  projectScore: number,
  rootScore: number,
) => {
  if (!signal.exists) {
    return 0;
  }

  return signal.scope === 'project' ? projectScore : rootScore;
};

const getScriptScore = (
  script: RepositorySignals['packageJson']['scripts']['build'],
  projectScore: number,
  rootScore: number,
) => {
  if (!script.exists) {
    return 0;
  }

  return script.scope === 'project' ? projectScore : rootScore;
};

const getToolScore = (
  signal: RepositorySignals['typescript'],
  projectScore: number,
  rootScore: number,
) => {
  if (!signal.found) {
    return 0;
  }

  return (signal.projectSources?.length ?? 0) > 0 ? projectScore : rootScore;
};

const getCiCheckScore = (found: boolean, score: number) => (found ? score : 0);

export const getStatusByScore = (score: number) => {
  if (score >= scoreThresholds.excellent) {
    return 'excellent' as const;
  }

  if (score >= scoreThresholds.good) {
    return 'good' as const;
  }

  if (score >= scoreThresholds.warning) {
    return 'warning' as const;
  }

  return 'critical' as const;
};

export const buildScoreBreakdown = (signals: RepositorySignals) => {
  const evidenceMap = buildReportEvidenceMap(signals);
  const documentationScore = clampScore(
    getScopedPathScore(signals.readme, 45, 25) +
      (signals.readme.isSubstantial ? 15 : 0) +
      (signals.readme.hasUsageSection ? 10 : 0) +
      (signals.readme.hasInstallSection ? 10 : 0) +
      getScopedPathScore(signals.envExample, 15, 8) +
      5,
  );
  const testingScore = clampScore(
    (signals.packageJson.exists ? 25 : 0) +
      getScriptScore(signals.packageJson.scripts.test, 55, 30) +
      getToolScore(signals.testingLibrary, 20, 10),
  );
  const ciScopePenalty =
    signals.projectPath && signals.ci.exists && !signals.ciAnalysis.projectScope.found ? 10 : 0;
  const ciScore = clampScore(
    (signals.ci.exists ? 15 : 0) +
      getCiCheckScore(signals.ciAnalysis.pullRequest.found, 15) +
      getCiCheckScore(signals.ciAnalysis.install.found, 15) +
      getCiCheckScore(signals.ciAnalysis.lint.found, 15) +
      getCiCheckScore(signals.ciAnalysis.test.found, 20) +
      getCiCheckScore(signals.ciAnalysis.build.found, 15) +
      getCiCheckScore(signals.ciAnalysis.projectScope.found, 10) +
      getScriptScore(signals.packageJson.scripts.build, 5, 3) -
      ciScopePenalty,
  );
  const dependenciesScore = clampScore(
    (signals.packageJson.exists ? 30 : 0) +
      (signals.lockfile.exists ? 30 : 0) +
      (signals.dependencyHealth.primaryPackageManager ? 15 : 0) +
      (signals.lockfile.exists && !signals.dependencyHealth.hasMixedLockfiles ? 10 : 0) +
      (signals.dependencyHealth.primaryPackageManager &&
      !signals.dependencyHealth.packageManagerMismatch
        ? 10
        : 0) +
      (signals.dependencyHealth.misplacedDevDependencySources.length === 0 ? 5 : 0),
  );
  const maintainabilityScore = clampScore(
    getToolScore(signals.typescript, 35, 18) +
      getScriptScore(signals.packageJson.scripts.lint, 35, 18) +
      (signals.packageJson.exists ? 20 : 0) +
      getToolScore(signals.storybook, 10, 5),
  );
  const performanceScore = clampScore(
    getScriptScore(signals.packageJson.scripts.build, 45, 25) +
      getToolScore(signals.bundler, 35, 18) +
      (signals.packageJson.exists ? 20 : 0),
  );
  const accessibilityScore = clampScore(
    getToolScore(signals.a11yTooling, 55, 30) +
      getToolScore(signals.storybook, 25, 12) +
      getToolScore(signals.testingLibrary, 20, 10),
  );

  return [
    {
      category: 'documentation' as const,
      label: 'Documentation',
      value: documentationScore,
      maxValue: 100,
      status: getStatusByScore(documentationScore),
      description: 'README and environment documentation signals found in the repository.',
      evidence: pickReportEvidence(evidenceMap, ['readme', 'env-example']),
    },
    {
      category: 'testing' as const,
      label: 'Testing',
      value: testingScore,
      maxValue: 100,
      status: getStatusByScore(testingScore),
      description: 'Test scripts and common frontend testing dependencies.',
      evidence: pickReportEvidence(evidenceMap, ['package-json', 'test-script', 'testing-library']),
    },
    {
      category: 'ci' as const,
      label: 'CI/CD',
      value: ciScore,
      maxValue: 100,
      status: getStatusByScore(ciScore),
      description: 'Automated delivery checks from GitHub Actions and build scripts.',
      evidence: pickReportEvidence(evidenceMap, [
        'github-actions',
        'ci-pr-trigger',
        'ci-install-step',
        'ci-lint-step',
        'ci-test-step',
        'ci-build-step',
        'ci-project-scope',
        'build-script',
      ]),
    },
    {
      category: 'dependencies' as const,
      label: 'Dependencies',
      value: dependenciesScore,
      maxValue: 100,
      status: getStatusByScore(dependenciesScore),
      description: 'Package metadata and lockfile consistency signals.',
      evidence: pickReportEvidence(evidenceMap, [
        'package-json',
        'lockfile',
        'lockfile-consistency',
        'package-manager',
        'dependency-hygiene',
      ]),
    },
    {
      category: 'maintainability' as const,
      label: 'Maintainability',
      value: maintainabilityScore,
      maxValue: 100,
      status: getStatusByScore(maintainabilityScore),
      description: 'TypeScript, linting and project structure maintainability signals.',
      evidence: pickReportEvidence(evidenceMap, ['typescript', 'lint-script', 'storybook']),
    },
    {
      category: 'performance' as const,
      label: 'Performance',
      value: performanceScore,
      maxValue: 100,
      status: getStatusByScore(performanceScore),
      description: 'Build tooling and frontend bundler readiness.',
      evidence: pickReportEvidence(evidenceMap, ['build-script', 'bundler']),
    },
    {
      category: 'accessibility' as const,
      label: 'Accessibility',
      value: accessibilityScore,
      maxValue: 100,
      status: getStatusByScore(accessibilityScore),
      description: 'Accessibility linting, component review and testing signals.',
      evidence: pickReportEvidence(evidenceMap, ['a11y-tooling', 'storybook', 'testing-library']),
    },
  ];
};
