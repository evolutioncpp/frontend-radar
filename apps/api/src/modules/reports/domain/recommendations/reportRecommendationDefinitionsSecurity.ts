import { firstSource } from './reportRecommendationHelpers.js';

import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const removeSensitiveFilesRecommendation = {
  id: 'remove-sensitive-files',
  severity: 'high',
  categories: ['security'],
  checkIds: ['security-sensitive-files'],
  impactLevel: 'key',
  effort: 'medium',
  title: 'Remove sensitive files from the repository',
  description:
    'Remove committed env, npmrc or private key files and rotate any exposed credentials before using the repository again.',
  action:
    'Delete committed sensitive files, rotate exposed credentials and keep only safe examples.',
  isApplicable: (signals) => signals.security.sensitiveFiles.found,
  getSource: (signals) => firstSource(...signals.security.sensitiveFiles.sources),
} as const satisfies RecommendationDefinition;

export const replaceHardcodedSecretRecommendation = {
  id: 'replace-hardcoded-secret',
  severity: 'high',
  categories: ['security'],
  checkIds: ['security-secret-patterns'],
  impactLevel: 'key',
  effort: 'medium',
  title: 'Move hardcoded secrets out of source code',
  description:
    'Replace hardcoded secret-looking values with environment variables or a secret manager. The report intentionally does not expose the values.',
  action:
    'Move secret-looking values to environment variables or a secret manager and rotate them.',
  isApplicable: (signals) => signals.security.hardcodedSecrets.found,
  getSource: (signals) => firstSource(...signals.security.hardcodedSecrets.sources),
} as const satisfies RecommendationDefinition;

export const ignoreSecretFilesRecommendation = {
  id: 'ignore-secret-files',
  severity: 'medium',
  categories: ['security'],
  checkIds: ['security-gitignore'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Ignore local secret files',
  description:
    'Add .env*, .npmrc and private key patterns to .gitignore so local credentials are harder to commit accidentally.',
  action: 'Add env, npmrc and private-key patterns to .gitignore.',
  isApplicable: (signals) =>
    !signals.security.gitignore.exists ||
    !signals.security.gitignore.coversEnvFiles ||
    !signals.security.gitignore.coversNpmrc ||
    !signals.security.gitignore.coversPrivateKeys,
  getSource: (signals) => signals.security.gitignore.path ?? '.gitignore',
} as const satisfies RecommendationDefinition;
