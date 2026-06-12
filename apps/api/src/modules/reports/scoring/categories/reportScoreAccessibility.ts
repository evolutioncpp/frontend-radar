import { createMetric, createToolCheck } from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildAccessibilityScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'accessibility',
    label: 'Accessibility',
    description: 'Accessibility linting, component review and testing signals.',
    checks: [
      createToolCheck({
        id: 'a11y-tooling',
        label: 'Accessibility tooling',
        max: 50,
        missingDescription: 'No accessibility-focused dependency was found.',
        partialEarned: 25,
        signal: signals.a11yTooling,
        severity: 'major',
      }),
      createToolCheck({
        id: 'storybook',
        label: 'Storybook',
        max: 25,
        missingDescription: 'Storybook configuration or dependency was not found.',
        partialEarned: 12,
        signal: signals.storybook,
        severity: 'minor',
      }),
      createToolCheck({
        id: 'testing-library',
        label: 'Testing tooling',
        max: 25,
        missingDescription: 'No common frontend testing dependency was found.',
        partialEarned: 12,
        signal: signals.testingLibrary,
        severity: 'minor',
      }),
    ],
  });
