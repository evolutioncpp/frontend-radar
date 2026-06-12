import { createMetric, createScriptCheck, createToolCheck } from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildMaintainabilityScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'maintainability',
    label: 'Maintainability',
    description: 'TypeScript, linting and project structure maintainability signals.',
    checks: [
      createToolCheck({
        id: 'typescript',
        label: 'TypeScript',
        max: 25,
        missingDescription: 'TypeScript configuration or dependency was not found.',
        partialEarned: 12,
        signal: signals.typescript,
        severity: 'major',
      }),
      createScriptCheck({
        id: 'lint-script',
        label: 'Lint script',
        max: 25,
        missingDescription: 'package.json does not expose a lint script.',
        partialEarned: 12,
        script: signals.packageJson.scripts.lint,
        severity: 'major',
      }),
      createToolCheck({
        id: 'linting',
        label: 'Linting tooling',
        max: 20,
        missingDescription: 'Linting configuration or dependency was not found.',
        partialEarned: 10,
        signal: signals.linting,
        severity: 'major',
      }),
      createToolCheck({
        id: 'formatting',
        label: 'Formatting tooling',
        max: 15,
        missingDescription: 'Formatting configuration or dependency was not found.',
        partialEarned: 7,
        signal: signals.formatting,
        severity: 'minor',
      }),
      createToolCheck({
        id: 'storybook',
        label: 'Storybook',
        max: 15,
        missingDescription: 'Storybook configuration or dependency was not found.',
        partialEarned: 7,
        signal: signals.storybook,
        severity: 'minor',
      }),
    ],
  });
