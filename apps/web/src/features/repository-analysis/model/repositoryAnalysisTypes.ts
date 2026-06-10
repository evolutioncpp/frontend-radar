export interface RepositoryAnalysisRequest {
  owner: string;
  projectPath?: string | null;
  projectPathSource?: 'url' | 'manual';
  repository: string;
  normalizedUrl: string;
}
