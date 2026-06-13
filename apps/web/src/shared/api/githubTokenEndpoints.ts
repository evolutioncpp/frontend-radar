export const githubTokenEndpointNames = [
  'createReportAnalysis',
  'forceRefreshReportAnalysis',
  'listRepositoryBranches',
  'retryReportAnalysis',
] as const;

const githubTokenEndpointNameSet = new Set<string>(githubTokenEndpointNames);

export const shouldAttachGithubToken = (endpointName: string) => {
  return githubTokenEndpointNameSet.has(endpointName);
};
