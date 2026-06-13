export const githubTokenSettingsUrl = 'https://github.com/settings/personal-access-tokens/new';

export const githubTokenHelpStepTranslationKeys = [
  'openSettings',
  'createFineGrained',
  'selectRepositories',
  'copyToken',
] as const;

export const githubTokenHelpPermissionTranslationKeys = ['contents', 'metadata'] as const;

export const getMaskedGithubToken = (token: string) => {
  const suffix = token.slice(-4);

  return suffix ? `********${suffix}` : '********';
};
