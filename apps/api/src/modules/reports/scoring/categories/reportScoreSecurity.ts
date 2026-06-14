import { createCheck, createMetric } from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

const getSensitiveFilesCheck = (signals: RepositorySignals) =>
  createCheck({
    id: 'security-sensitive-files',
    label: 'Sensitive files',
    max: 25,
    earned: signals.security.sensitiveFiles.found ? 0 : 25,
    status: signals.security.sensitiveFiles.found ? 'failed' : 'passed',
    severity: 'critical',
    scope: signals.security.sensitiveFiles.files.some((file) => file.scope === 'root')
      ? 'repository'
      : 'project',
    confidence: 'high',
    source:
      signals.security.sensitiveFiles.sources.join(', ') || signals.projectPath || 'source tree',
    description: signals.security.sensitiveFiles.found
      ? 'Sensitive env, npmrc or private key files were found in the repository.'
      : 'No sensitive env, npmrc or private key files were detected.',
  });

const getHardcodedSecretsCheck = (signals: RepositorySignals) => {
  if (signals.sourceCode.files.count === 0) {
    return createCheck({
      id: 'security-secret-patterns',
      label: 'Hardcoded secret patterns',
      max: 35,
      earned: 18,
      status: 'unknown',
      severity: 'major',
      scope: 'project',
      confidence: 'medium',
      source: signals.projectPath || 'source tree',
      description:
        'Source files were not found, so hardcoded secret patterns could not be evaluated.',
    });
  }

  return createCheck({
    id: 'security-secret-patterns',
    label: 'Hardcoded secret patterns',
    max: 35,
    earned: signals.security.hardcodedSecrets.found ? 0 : 35,
    status: signals.security.hardcodedSecrets.found ? 'failed' : 'passed',
    severity: 'critical',
    scope: 'project',
    confidence: signals.sourceCode.files.isTruncated ? 'medium' : 'high',
    source:
      signals.security.hardcodedSecrets.sources.join(', ') ||
      signals.sourceCode.files.sources.join(', ') ||
      signals.projectPath ||
      'source tree',
    description: signals.security.hardcodedSecrets.found
      ? 'High-confidence hardcoded secret patterns were detected. Values are redacted from the report.'
      : 'No high-confidence hardcoded secret patterns were detected in scanned source/config files.',
  });
};

const getEnvDocumentationCheck = (signals: RepositorySignals) => {
  if (!signals.security.envUsage.found) {
    return createCheck({
      id: 'security-env-documentation',
      label: 'Environment documentation',
      max: 20,
      earned: 20,
      status: 'not_applicable',
      severity: 'minor',
      scope: 'project',
      confidence: signals.sourceCode.files.isTruncated ? 'medium' : 'high',
      source: signals.projectPath || 'source tree',
      description: 'No environment variable usage was detected in scanned source/config files.',
    });
  }

  if (!signals.envExample.exists) {
    return createCheck({
      id: 'security-env-documentation',
      label: 'Environment documentation',
      max: 20,
      earned: 8,
      status: 'partial',
      severity: 'major',
      scope: 'project',
      confidence: signals.sourceCode.files.isTruncated ? 'medium' : 'high',
      source: signals.security.envUsage.sources.join(', ') || signals.projectPath || 'source tree',
      description: 'Environment variables are used, but no .env.example file was found.',
    });
  }

  return createCheck({
    id: 'security-env-documentation',
    label: 'Environment documentation',
    max: 20,
    earned: signals.envExample.scope === 'root' && signals.isNestedProject ? 12 : 20,
    status: signals.envExample.scope === 'root' && signals.isNestedProject ? 'partial' : 'passed',
    severity: 'major',
    scope: signals.envExample.scope === 'root' ? 'root' : 'project',
    confidence: 'high',
    source: signals.envExample.path ?? '.env.example',
    description:
      signals.envExample.scope === 'root' && signals.isNestedProject
        ? 'Environment variables are used, but only a root-level environment example was found.'
        : 'Environment variables are documented with an environment example file.',
  });
};

const getGitignoreCheck = (signals: RepositorySignals) => {
  if (!signals.security.gitignore.exists) {
    return createCheck({
      id: 'security-gitignore',
      label: 'Secret file gitignore coverage',
      max: 20,
      earned: 8,
      status: 'partial',
      severity: 'major',
      scope: 'repository',
      confidence: 'medium',
      source: '.gitignore',
      description: '.gitignore was not found, so secret file ignore rules could not be verified.',
    });
  }

  const isCovered =
    signals.security.gitignore.coversEnvFiles &&
    signals.security.gitignore.coversNpmrc &&
    signals.security.gitignore.coversPrivateKeys;

  return createCheck({
    id: 'security-gitignore',
    label: 'Secret file gitignore coverage',
    max: 20,
    earned: isCovered ? 20 : 12,
    status: isCovered ? 'passed' : 'partial',
    severity: 'major',
    scope: signals.security.gitignore.scope === 'root' ? 'root' : 'project',
    confidence: 'high',
    source: signals.security.gitignore.path ?? '.gitignore',
    description: isCovered
      ? '.gitignore includes patterns for env, npmrc and private key files.'
      : '.gitignore was found, but env, npmrc or private key ignore patterns are incomplete.',
  });
};

export const buildSecurityScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'security',
    label: 'Security',
    description: 'Repository hygiene signals for secrets and environment configuration.',
    checks: [
      getSensitiveFilesCheck(signals),
      getHardcodedSecretsCheck(signals),
      getEnvDocumentationCheck(signals),
      getGitignoreCheck(signals),
    ],
  });
