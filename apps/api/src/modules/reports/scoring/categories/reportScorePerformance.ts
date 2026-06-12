import {
  createCiCheck,
  createMetric,
  createScriptCheck,
  createToolCheck,
} from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildPerformanceScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'performance',
    label: 'Performance',
    description: 'Build tooling and frontend bundler readiness.',
    checks: [
      createScriptCheck({
        id: 'build-script',
        label: 'Build script',
        max: 45,
        missingDescription: 'package.json does not expose a build script.',
        partialEarned: 24,
        script: signals.packageJson.scripts.build,
        severity: 'critical',
      }),
      createToolCheck({
        id: 'bundler',
        label: 'Frontend bundler',
        max: 35,
        missingDescription: 'No common frontend bundler dependency was found.',
        partialEarned: 18,
        signal: signals.bundler,
        severity: 'major',
      }),
      createCiCheck({
        id: 'ci-build-step',
        label: 'CI build step',
        max: 20,
        missingDescription: 'No build step was detected in analyzed workflows.',
        signal: signals.ciAnalysis.build,
        severity: 'minor',
      }),
    ],
  });
