import {
  compactSources,
  createSource,
  sourceFromTool,
  type AnalysisSource,
} from './reportAnalysisSourceBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildSourceCodeSources = (signals: RepositorySignals): AnalysisSource[] => [
  createSource({
    description: signals.sourceCode.files.isTruncated
      ? 'Only a bounded subset of source files was analyzed.'
      : `${signals.sourceCode.files.count} source file(s) were analyzed.`,
    id: 'source-files',
    kind: 'file',
    label: 'Source files',
    scope: 'project',
    source: compactSources(signals.sourceCode.files.sources),
    status:
      signals.sourceCode.files.count > 0
        ? signals.sourceCode.files.isTruncated
          ? 'warning'
          : 'found'
        : 'missing',
  }),
  createSource({
    description:
      signals.testQuality.files.count > 0
        ? `${signals.testQuality.files.count} test file(s) were found.`
        : 'No test or spec files were found in the selected frontend path.',
    id: 'test-files',
    kind: 'file',
    label: 'Test files',
    scope: 'project',
    source: compactSources(signals.testQuality.files.sources),
    status: signals.testQuality.files.count > 0 ? 'found' : 'missing',
  }),
  createSource({
    description: !signals.testQuality.coverage.found
      ? 'No coverage script or coverage configuration was detected.'
      : signals.testQuality.coverage.scope === 'root'
        ? 'Only a root-level coverage script or coverage configuration was detected.'
        : 'A coverage script or coverage configuration was detected.',
    id: 'test-coverage',
    kind: 'script',
    label: 'Coverage signal',
    scope: signals.testQuality.coverage.scope ?? 'project',
    source: compactSources(signals.testQuality.coverage.sources),
    status: signals.testQuality.coverage.found
      ? signals.testQuality.coverage.scope === 'root'
        ? 'warning'
        : 'found'
      : 'missing',
  }),
  sourceFromTool({
    id: 'typescript',
    label: 'TypeScript',
    signal: signals.typescript,
  }),
  createSource({
    description: signals.typescriptQuality.config.exists
      ? signals.typescriptQuality.config.hasMissingConfig
        ? 'TypeScript configuration was found, but a referenced or extended config is missing.'
        : signals.typescriptQuality.config.hasParseError
          ? 'TypeScript configuration was found, but at least one config could not be parsed.'
          : 'TypeScript configuration was found.'
      : 'TypeScript configuration was not found.',
    id: 'typescript-config',
    kind: 'file',
    label: 'TypeScript config',
    scope: signals.typescriptQuality.config.scope ?? 'project',
    source: compactSources(
      (signals.typescriptQuality.config.configPaths ?? []).length > 0
        ? (signals.typescriptQuality.config.configPaths ?? [])
        : signals.typescriptQuality.config.path
          ? [signals.typescriptQuality.config.path]
          : [],
    ),
    status: signals.typescriptQuality.config.exists
      ? signals.typescriptQuality.config.hasMissingConfig ||
        signals.typescriptQuality.config.hasParseError
        ? 'warning'
        : 'found'
      : 'missing',
  }),
  createSource({
    description: signals.typescriptQuality.typecheck.exists
      ? 'package.json exposes a dedicated typecheck script.'
      : 'package.json does not expose a dedicated typecheck script.',
    id: 'typecheck-script',
    kind: 'script',
    label: 'Typecheck script',
    scope: signals.typescriptQuality.typecheck.scope ?? 'project',
    source: signals.typescriptQuality.typecheck.source,
    status: signals.typescriptQuality.typecheck.exists ? 'found' : 'missing',
  }),
  createSource({
    description:
      signals.sourceCode.codeHealth.issueCount > 0
        ? `${signals.sourceCode.codeHealth.issueCount} source-level maintainability warning(s) were detected.`
        : 'No obvious debug, TODO, eslint-disable or explicit any hotspots were detected.',
    id: 'code-health',
    kind: 'file',
    label: 'Source health',
    scope: 'project',
    source: compactSources(signals.sourceCode.codeHealth.sources),
    status:
      signals.sourceCode.files.count === 0
        ? 'missing'
        : signals.sourceCode.codeHealth.issueCount > 0
          ? 'warning'
          : 'found',
  }),
  createSource({
    description: signals.sourceCode.codeSplitting.found
      ? 'Lazy loading or dynamic imports were detected in source files.'
      : 'No lazy loading or dynamic import signal was detected.',
    id: 'code-splitting',
    kind: 'file',
    label: 'Code splitting',
    scope: 'project',
    source: compactSources(signals.sourceCode.codeSplitting.sources),
    status: signals.sourceCode.codeSplitting.found ? 'found' : 'missing',
  }),
];
