import {
  createMetric,
  createPathCheck,
  createScriptCheck,
  createToolCheck,
} from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildTestingScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'testing',
    label: 'Testing',
    description: 'Test scripts and common frontend testing dependencies.',
    checks: [
      createPathCheck({
        id: 'package-json',
        label: 'package.json',
        max: 20,
        missingDescription: 'package.json was not found.',
        partialEarned: 0,
        severity: 'critical',
        signal: {
          exists: signals.packageJson.exists,
          path: signals.packageJson.path,
          scope: signals.packageJson.scope,
        },
        signals,
      }),
      createScriptCheck({
        id: 'test-script',
        label: 'Test script',
        max: 45,
        missingDescription: 'package.json does not expose a test script.',
        partialEarned: 24,
        script: signals.packageJson.scripts.test,
        severity: 'major',
      }),
      createToolCheck({
        id: 'testing-library',
        label: 'Testing tooling',
        max: 35,
        missingDescription: 'No common frontend testing dependency was found.',
        partialEarned: 18,
        signal: signals.testingLibrary,
        severity: 'major',
      }),
    ],
  });
