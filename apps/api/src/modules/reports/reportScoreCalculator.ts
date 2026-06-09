import { scoreThresholds } from './reportAnalysisConfig.js';

import type { RepositorySignals } from './reportSignals.js';

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

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
  const documentationScore = clampScore(
    (signals.hasReadme ? 70 : 0) + (signals.hasEnvExample ? 15 : 0) + 15,
  );
  const testingScore = clampScore(
    (signals.hasPackageJson ? 25 : 0) +
      (signals.hasTestScript ? 55 : 0) +
      (signals.hasTestingLibrary ? 20 : 0),
  );
  const ciScore = clampScore(signals.hasCi ? 95 : signals.hasBuildScript ? 45 : 25);
  const dependenciesScore = clampScore(
    (signals.hasPackageJson ? 45 : 0) + (signals.hasLockfile ? 35 : 0) + 20,
  );
  const maintainabilityScore = clampScore(
    (signals.hasTypescript ? 35 : 0) +
      (signals.hasLintScript ? 35 : 0) +
      (signals.hasPackageJson ? 20 : 0) +
      (signals.hasStorybook ? 10 : 0),
  );
  const performanceScore = clampScore(
    (signals.hasBuildScript ? 45 : 0) +
      (signals.hasBundler ? 35 : 0) +
      (signals.hasPackageJson ? 20 : 0),
  );
  const accessibilityScore = clampScore(
    (signals.hasA11yTooling ? 55 : 0) +
      (signals.hasStorybook ? 25 : 0) +
      (signals.hasTestingLibrary ? 20 : 0),
  );

  return [
    {
      category: 'documentation' as const,
      label: 'Documentation',
      value: documentationScore,
      maxValue: 100,
      status: getStatusByScore(documentationScore),
      description: 'README and environment documentation signals found in the repository.',
    },
    {
      category: 'testing' as const,
      label: 'Testing',
      value: testingScore,
      maxValue: 100,
      status: getStatusByScore(testingScore),
      description: 'Test scripts and common frontend testing dependencies.',
    },
    {
      category: 'ci' as const,
      label: 'CI/CD',
      value: ciScore,
      maxValue: 100,
      status: getStatusByScore(ciScore),
      description: 'Automated delivery checks from GitHub Actions and build scripts.',
    },
    {
      category: 'dependencies' as const,
      label: 'Dependencies',
      value: dependenciesScore,
      maxValue: 100,
      status: getStatusByScore(dependenciesScore),
      description: 'Package metadata and lockfile consistency signals.',
    },
    {
      category: 'maintainability' as const,
      label: 'Maintainability',
      value: maintainabilityScore,
      maxValue: 100,
      status: getStatusByScore(maintainabilityScore),
      description: 'TypeScript, linting and project structure maintainability signals.',
    },
    {
      category: 'performance' as const,
      label: 'Performance',
      value: performanceScore,
      maxValue: 100,
      status: getStatusByScore(performanceScore),
      description: 'Build tooling and frontend bundler readiness.',
    },
    {
      category: 'accessibility' as const,
      label: 'Accessibility',
      value: accessibilityScore,
      maxValue: 100,
      status: getStatusByScore(accessibilityScore),
      description: 'Accessibility linting, component review and testing signals.',
    },
  ];
};
