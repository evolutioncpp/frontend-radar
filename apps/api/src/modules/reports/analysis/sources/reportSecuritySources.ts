import {
  compactSources,
  createSource,
  type AnalysisSource,
} from './reportAnalysisSourceBuilders.js';

import type { RepositorySignals } from '../../domain/reportSignalContracts.js';

export const buildSecuritySources = (signals: RepositorySignals): AnalysisSource[] => [
  createSource({
    description: signals.security.sensitiveFiles.found
      ? 'Sensitive env, npmrc or private key files were detected. Values are not read into the report.'
      : 'No sensitive env, npmrc or private key files were detected.',
    id: 'security-sensitive-files',
    kind: 'file',
    label: 'Sensitive files',
    scope: signals.security.sensitiveFiles.files.some((file) => file.scope === 'root')
      ? 'repository'
      : 'project',
    source: compactSources(signals.security.sensitiveFiles.sources),
    status: signals.security.sensitiveFiles.found ? 'warning' : 'found',
  }),
  createSource({
    description: signals.security.hardcodedSecrets.found
      ? 'High-confidence hardcoded secret patterns were detected. Values are redacted.'
      : 'No high-confidence hardcoded secret patterns were detected in scanned source/config files.',
    id: 'security-secret-patterns',
    kind: 'file',
    label: 'Hardcoded secret patterns',
    scope: 'project',
    source: compactSources(signals.security.hardcodedSecrets.sources),
    status: signals.security.hardcodedSecrets.found ? 'warning' : 'found',
  }),
  createSource({
    description: signals.security.envUsage.found
      ? signals.envExample.exists
        ? 'Environment variable usage is documented with an environment example file.'
        : 'Environment variables are used, but no environment example file was found.'
      : 'No environment variable usage was detected in scanned source/config files.',
    id: 'security-env-documentation',
    kind: 'file',
    label: 'Environment documentation',
    scope: signals.envExample.scope ?? 'project',
    source: compactSources([
      ...signals.security.envUsage.sources,
      ...(signals.envExample.path ? [signals.envExample.path] : []),
    ]),
    status: signals.security.envUsage.found
      ? signals.envExample.exists
        ? signals.envExample.scope === 'root'
          ? 'warning'
          : 'found'
        : 'missing'
      : 'found',
  }),
  createSource({
    description: !signals.security.gitignore.exists
      ? '.gitignore was not found, so secret file ignore rules could not be verified.'
      : signals.security.gitignore.coversEnvFiles &&
          signals.security.gitignore.coversNpmrc &&
          signals.security.gitignore.coversPrivateKeys
        ? '.gitignore includes patterns for env, npmrc and private key files.'
        : '.gitignore was found, but env, npmrc or private key ignore patterns are incomplete.',
    id: 'security-gitignore',
    kind: 'file',
    label: 'Secret file gitignore coverage',
    scope: signals.security.gitignore.scope ?? 'repository',
    source: signals.security.gitignore.path,
    status: !signals.security.gitignore.exists
      ? 'missing'
      : signals.security.gitignore.coversEnvFiles &&
          signals.security.gitignore.coversNpmrc &&
          signals.security.gitignore.coversPrivateKeys
        ? 'found'
        : 'warning',
  }),
];
