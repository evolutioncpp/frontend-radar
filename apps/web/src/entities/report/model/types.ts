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

export type ProjectPathSource = 'autodetect' | 'url' | 'manual';

export type ProjectDetectionConfidence = 'high' | 'medium' | 'low';

export type ProjectDetection = {
  source: ProjectPathSource;
  path: string | null;
  packageJsonPath: string | null;
  confidence: ProjectDetectionConfidence;
  signals: ReportEvidence[];
};

export type AnalysisSourceKind =
  | 'github_api'
  | 'file'
  | 'directory'
  | 'package_json'
  | 'script'
  | 'dependency'
  | 'workflow';

export type AnalysisSourceScope = 'repository' | 'root' | 'project' | 'github';

export type AnalysisSource = {
  id: string;
  kind: AnalysisSourceKind;
  scope: AnalysisSourceScope;
  status: ReportEvidenceStatus;
  label: string;
  description?: string;
  source?: string;
};

export type ToolingItem = {
  id: string;
  label: string;
  status: ReportEvidenceStatus;
  sources: string[];
};

export type ReportTooling = {
  packageManager: ToolingItem[];
  frameworks: ToolingItem[];
  bundlers: ToolingItem[];
  testing: ToolingItem[];
  linting: ToolingItem[];
  formatting: ToolingItem[];
  typing: ToolingItem[];
  uiReview: ToolingItem[];
  accessibility: ToolingItem[];
};

export type ReportRepository = {
  owner: string;
  name: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  defaultBranch: string;
  branch: string;
  projectPath: string | null;
  projectDetection: ProjectDetection;
  latestCommitSha: string | null;
  latestCommitDate: string | null;
  latestCommitTitle: string | null;
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
  analysisSources: AnalysisSource[];
  tooling: ReportTooling;
  totalScore: number;
  scoreBreakdown: ScoreBreakdownItem[];
  checks: ReportCheck[];
  recommendations: ReportRecommendation[];
  createdAt: string;
};
