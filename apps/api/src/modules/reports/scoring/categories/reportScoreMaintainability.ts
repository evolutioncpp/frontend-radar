import { sourceCodeAnalysisConfig } from '../../domain/reportAnalysisConfig.js';
import {
  createCheck,
  createMetric,
  createScriptCheck,
  createToolCheck,
} from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

const getStrictStatus = (signals: RepositorySignals) => {
  if (!signals.typescriptQuality.config.exists) {
    return {
      earned: 0,
      status: 'failed' as const,
      description: 'TypeScript strictness could not be evaluated because tsconfig was not found.',
    };
  }

  if (
    signals.typescriptQuality.config.hasMissingConfig ||
    signals.typescriptQuality.config.parseError
  ) {
    return {
      earned: 6,
      status: 'unknown' as const,
      description:
        'TypeScript config was found, but one or more relevant configs could not be read or fully evaluated.',
    };
  }

  if (
    signals.typescriptQuality.config.strict ||
    (signals.typescriptQuality.config.noImplicitAny &&
      signals.typescriptQuality.config.strictNullChecks)
  ) {
    return {
      earned: 18,
      status: 'passed' as const,
      description:
        'TypeScript strictness is enabled through strict or equivalent compiler options.',
    };
  }

  return {
    earned: 6,
    status: 'partial' as const,
    description: 'TypeScript is configured, but strict compiler checks are not enabled.',
  };
};

const getCodeHealthStatus = (signals: RepositorySignals) => {
  const issueCount = signals.sourceCode.codeHealth.issueCount;

  if (signals.sourceCode.files.count === 0) {
    return {
      earned: 0,
      status: 'unknown' as const,
      description: 'Source files were not found in the selected frontend path.',
    };
  }

  if (issueCount >= sourceCodeAnalysisConfig.codeHealthIssueFailThreshold) {
    return {
      earned: 0,
      status: 'failed' as const,
      description: `${issueCount} source-level maintainability warning(s) were detected.`,
    };
  }

  if (issueCount >= sourceCodeAnalysisConfig.codeHealthIssueWarnThreshold) {
    return {
      earned: 5,
      status: 'partial' as const,
      description: `${issueCount} source-level maintainability warning(s) were detected.`,
    };
  }

  return {
    earned: 10,
    status: 'passed' as const,
    description: 'No obvious debug, TODO, eslint-disable or explicit any hotspots were detected.',
  };
};

export const buildMaintainabilityScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'maintainability',
    label: 'Maintainability',
    description: 'TypeScript, linting and project structure maintainability signals.',
    checks: [
      createToolCheck({
        id: 'typescript',
        label: 'TypeScript',
        max: 15,
        missingDescription: 'TypeScript configuration or dependency was not found.',
        partialEarned: 8,
        signal: signals.typescript,
        severity: 'critical',
      }),
      createCheck({
        id: 'typescript-config',
        label: 'TypeScript config',
        max: 12,
        earned: signals.typescriptQuality.config.exists
          ? signals.typescriptQuality.config.hasMissingConfig ||
            signals.typescriptQuality.config.hasParseError
            ? 6
            : 12
          : 0,
        status: signals.typescriptQuality.config.exists
          ? signals.typescriptQuality.config.hasMissingConfig ||
            signals.typescriptQuality.config.hasParseError
            ? 'partial'
            : 'passed'
          : 'failed',
        severity: 'major',
        scope: signals.typescriptQuality.config.scope ?? 'project',
        confidence:
          signals.typescriptQuality.config.hasMissingConfig ||
          signals.typescriptQuality.config.hasParseError
            ? 'medium'
            : 'high',
        source:
          (signals.typescriptQuality.config.configPaths ?? []).join(', ') ||
          signals.typescriptQuality.config.path ||
          'tsconfig.json',
        description: signals.typescriptQuality.config.exists
          ? signals.typescriptQuality.config.hasMissingConfig
            ? 'TypeScript configuration was found, but a referenced or extended config is missing.'
            : signals.typescriptQuality.config.hasParseError
              ? 'TypeScript configuration was found, but at least one config could not be parsed.'
              : 'TypeScript configuration was found.'
          : 'TypeScript configuration was not found.',
      }),
      createCheck({
        id: 'typescript-strict',
        label: 'TypeScript strictness',
        max: 18,
        severity: 'major',
        scope: signals.typescriptQuality.config.scope ?? 'project',
        confidence: signals.typescriptQuality.config.parseError ? 'low' : 'high',
        source: signals.typescriptQuality.config.path ?? 'tsconfig.json',
        ...getStrictStatus(signals),
      }),
      createCheck({
        id: 'typecheck-script',
        label: 'Typecheck script',
        max: 12,
        earned: signals.typescriptQuality.typecheck.exists ? 12 : 0,
        status: signals.typescriptQuality.typecheck.exists ? 'passed' : 'failed',
        severity: 'major',
        scope: signals.typescriptQuality.typecheck.scope ?? 'project',
        confidence: 'high',
        source: signals.typescriptQuality.typecheck.source ?? 'package.json scripts.typecheck',
        description: signals.typescriptQuality.typecheck.exists
          ? 'package.json exposes a dedicated typecheck script.'
          : 'package.json does not expose a dedicated typecheck script.',
      }),
      createScriptCheck({
        id: 'lint-script',
        label: 'Lint script',
        max: 15,
        missingDescription: 'package.json does not expose a lint script.',
        partialEarned: 8,
        script: signals.packageJson.scripts.lint,
        severity: 'major',
      }),
      createToolCheck({
        id: 'linting',
        label: 'Linting tooling',
        max: 15,
        missingDescription: 'Linting configuration or dependency was not found.',
        partialEarned: 8,
        signal: signals.linting,
        severity: 'major',
      }),
      createToolCheck({
        id: 'formatting',
        label: 'Formatting tooling',
        max: 10,
        missingDescription: 'Formatting configuration or dependency was not found.',
        partialEarned: 5,
        signal: signals.formatting,
        severity: 'minor',
      }),
      createCheck({
        id: 'code-health',
        label: 'Source health',
        max: 10,
        severity: 'minor',
        scope: 'project',
        confidence: signals.sourceCode.files.isTruncated ? 'medium' : 'high',
        source:
          signals.sourceCode.codeHealth.sources.join(', ') ||
          signals.sourceCode.files.sources.join(', ') ||
          signals.projectPath ||
          'source tree',
        ...getCodeHealthStatus(signals),
      }),
      createToolCheck({
        id: 'storybook',
        label: 'Storybook',
        max: 10,
        missingDescription: 'Storybook configuration or dependency was not found.',
        partialEarned: 5,
        signal: signals.storybook,
        severity: 'minor',
      }),
    ],
  });
