import {
  createCiCheck,
  createCheck,
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
        max: 40,
        missingDescription: 'package.json does not expose a build script.',
        partialEarned: 22,
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
      createCheck({
        id: 'code-splitting',
        label: 'Code splitting',
        max: 5,
        earned: signals.sourceCode.codeSplitting.found ? 5 : 0,
        status: signals.sourceCode.codeSplitting.found ? 'passed' : 'not_applicable',
        severity: 'minor',
        scope: 'project',
        confidence: signals.sourceCode.files.isTruncated ? 'medium' : 'low',
        source:
          signals.sourceCode.codeSplitting.sources.join(', ') ||
          signals.sourceCode.files.sources.join(', ') ||
          signals.projectPath ||
          'source tree',
        description: signals.sourceCode.codeSplitting.found
          ? 'Lazy loading or dynamic imports were detected in source files.'
          : 'No lazy loading or dynamic import signal was detected.',
      }),
    ],
  });
