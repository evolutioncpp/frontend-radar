import {
  createCheck,
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
        max: 15,
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
        max: 25,
        missingDescription: 'package.json does not expose a test script.',
        partialEarned: 14,
        script: signals.packageJson.scripts.test,
        severity: 'major',
      }),
      createToolCheck({
        id: 'testing-library',
        label: 'Testing tooling',
        max: 25,
        missingDescription: 'No common frontend testing dependency was found.',
        partialEarned: 14,
        signal: signals.testingLibrary,
        severity: 'major',
      }),
      createCheck({
        id: 'test-files',
        label: 'Test files',
        max: 25,
        earned: signals.testQuality.files.count > 0 ? 25 : 0,
        status: signals.testQuality.files.count > 0 ? 'passed' : 'failed',
        severity: 'major',
        scope: 'project',
        confidence: signals.sourceCode.files.isTruncated ? 'medium' : 'high',
        source:
          signals.testQuality.files.sources.join(', ') || signals.projectPath || 'source tree',
        description:
          signals.testQuality.files.count > 0
            ? `${signals.testQuality.files.count} test file(s) were found.`
            : 'No test or spec files were found in the selected frontend path.',
      }),
      createCheck({
        id: 'test-coverage',
        label: 'Coverage signal',
        max: 10,
        earned: signals.testQuality.coverage.found
          ? signals.testQuality.coverage.scope === 'root'
            ? 5
            : 10
          : 0,
        status: signals.testQuality.coverage.found
          ? signals.testQuality.coverage.scope === 'root'
            ? 'partial'
            : 'passed'
          : 'failed',
        severity: 'minor',
        scope: signals.testQuality.coverage.scope ?? 'project',
        confidence: 'medium',
        source: signals.testQuality.coverage.sources.join(', ') || 'package.json scripts.test',
        description: !signals.testQuality.coverage.found
          ? 'No coverage script or coverage configuration was detected.'
          : signals.testQuality.coverage.scope === 'root'
            ? 'Only a root-level coverage script or configuration was detected.'
            : 'A coverage script or coverage configuration was detected.',
      }),
    ],
  });
