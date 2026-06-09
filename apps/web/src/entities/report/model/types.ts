export type ScoreStatus = 'excellent' | 'good' | 'warning' | 'critical';

export type ScoreCategory =
  | 'documentation'
  | 'testing'
  | 'ci'
  | 'dependencies'
  | 'maintainability'
  | 'performance'
  | 'accessibility';

export type RecommendationSeverity = 'low' | 'medium' | 'high';

export type CheckStatus = 'passed' | 'failed' | 'warning';

export type ReportEvidenceStatus = 'found' | 'missing' | 'warning';

export type ReportEvidence = {
  id: string;
  status: ReportEvidenceStatus;
  label: string;
  description?: string;
  source?: string;
};

export type ReportRepository = {
  owner: string;
  name: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  defaultBranch: string;
  latestCommitSha: string | null;
  latestCommitDate: string | null;
  license: string | null;
};

export type ScoreBreakdownItem = {
  category: ScoreCategory;
  label: string;
  value: number;
  maxValue: number;
  status: ScoreStatus;
  description: string;
  evidence: ReportEvidence[];
};

export type ReportCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  description?: string;
};

export type ReportRecommendation = {
  id: string;
  severity: RecommendationSeverity;
  title: string;
  description: string;
};

export type ProjectReport = {
  id: string;
  repository: ReportRepository;
  totalScore: number;
  scoreBreakdown: ScoreBreakdownItem[];
  checks: ReportCheck[];
  recommendations: ReportRecommendation[];
  createdAt: string;
};
