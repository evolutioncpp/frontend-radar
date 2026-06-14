import type { ScoreCategory } from '@/entities/report';

export interface RepositoryAnalysisRequest {
  branch?: string | null;
  enabledScoreCategories?: ScoreCategory[];
  owner: string;
  projectPath?: string | null;
  projectPathSource?: 'url' | 'manual';
  repository: string;
  normalizedUrl: string;
  saveToHistory?: boolean;
}

export interface ParsedRepositoryInput extends RepositoryAnalysisRequest {
  treePath?: string;
}
