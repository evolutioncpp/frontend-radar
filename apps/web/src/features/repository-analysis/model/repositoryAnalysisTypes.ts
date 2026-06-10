export interface RepositoryAnalysisRequest {
  branch?: string | null;
  owner: string;
  projectPath?: string | null;
  projectPathSource?: 'url' | 'manual';
  repository: string;
  normalizedUrl: string;
}

export interface ParsedRepositoryInput extends RepositoryAnalysisRequest {
  treePath?: string;
}
