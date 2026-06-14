import { sourceFromScript, type AnalysisSource } from './reportAnalysisSourceBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildScriptSources = (signals: RepositorySignals): AnalysisSource[] => [
  sourceFromScript({
    id: 'build-script',
    label: 'Build script',
    script: signals.packageJson.scripts.build,
  }),
  sourceFromScript({
    id: 'test-script',
    label: 'Test script',
    script: signals.packageJson.scripts.test,
  }),
  sourceFromScript({
    id: 'lint-script',
    label: 'Lint script',
    script: signals.packageJson.scripts.lint,
  }),
];
