import { sourceFromTool, type AnalysisSource } from './reportAnalysisSourceBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildToolingSources = (signals: RepositorySignals): AnalysisSource[] => [
  sourceFromTool({
    id: 'storybook',
    label: 'Storybook',
    signal: signals.storybook,
  }),
  sourceFromTool({
    id: 'frameworks',
    label: 'Frontend frameworks',
    signal: signals.frameworks,
  }),
  sourceFromTool({
    id: 'bundler',
    label: 'Frontend bundler',
    signal: signals.bundler,
  }),
  sourceFromTool({
    id: 'testing',
    label: 'Testing tooling',
    signal: signals.testingLibrary,
  }),
  sourceFromTool({
    id: 'linting',
    label: 'Linting tooling',
    signal: signals.linting,
  }),
  sourceFromTool({
    id: 'formatting',
    label: 'Formatting tooling',
    signal: signals.formatting,
  }),
  sourceFromTool({
    id: 'accessibility',
    label: 'Accessibility tooling',
    signal: signals.a11yTooling,
  }),
];
