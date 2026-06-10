export interface RepositoryAnalysisRequest {
  owner: string;
  projectPath?: string | null;
  repository: string;
  normalizedUrl: string;
}
