import { z } from 'zod/v4';
import {
  githubOwnerPattern,
  githubRepositoryPattern,
  isGithubBranchName,
  isGithubProjectPath,
  normalizeGithubBranchName,
  normalizeGithubProjectPath,
} from '@frontend-radar/github-repository';

import { reportScoreCheckIds } from '../scoring/reportScoreCheckIds.js';

export const reportAnalysisStatuses = ['queued', 'running', 'completed', 'failed'] as const;
export const reportAnalysisProgressStages = [
  'queued',
  'starting',
  'repository_metadata',
  'project_detection',
  'repository_signals',
  'source_scan',
  'scoring',
  'report_building',
] as const;
export const reportProjectPathSources = ['autodetect', 'url', 'manual'] as const;
export const projectDetectionConfidences = ['high', 'medium', 'low'] as const;
export const reportAnalysisErrorCodes = [
  'repository_not_found',
  'repository_forbidden',
  'github_rate_limited',
  'github_unavailable',
  'branch_not_found',
  'project_path_not_found',
  'repository_verification_failed',
  'analysis_failed',
] as const;

export const scoreStatuses = ['excellent', 'good', 'warning', 'critical'] as const;
export const scoreCategories = [
  'documentation',
  'testing',
  'ci',
  'dependencies',
  'maintainability',
  'performance',
  'accessibility',
] as const;
export const checkStatuses = ['passed', 'failed', 'warning'] as const;
export const signalStatuses = ['found', 'missing', 'warning'] as const;
export const scoringCheckStatuses = [
  'passed',
  'partial',
  'failed',
  'unknown',
  'not_applicable',
] as const;
export const scoringCheckSeverities = ['critical', 'major', 'minor'] as const;
export const scoringCheckScopes = ['project', 'root', 'workspace', 'repository', 'github'] as const;
export const scoringCheckConfidences = ['high', 'medium', 'low'] as const;
export const scoreImpactLevels = ['key', 'important', 'supporting'] as const;
export const recommendationSeverities = ['low', 'medium', 'high'] as const;
export const analysisSourceKinds = [
  'github_api',
  'file',
  'directory',
  'package_json',
  'script',
  'dependency',
  'workflow',
] as const;
export const analysisSourceScopes = ['repository', 'root', 'project', 'github'] as const;
export const toolingGroups = [
  'packageManager',
  'frameworks',
  'bundlers',
  'testing',
  'linting',
  'formatting',
  'typing',
  'uiReview',
  'accessibility',
] as const;
export const toolingSourceKinds = [
  'file',
  'dependency',
  'script',
  'workflow',
  'github_api',
  'directory',
  'workspace',
] as const;
export const toolingSourceSections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
  'scripts',
] as const;

export const reportAnalysisStatusSchema = z.enum(reportAnalysisStatuses);
export const reportAnalysisProgressStageSchema = z.enum(reportAnalysisProgressStages);
export const reportProjectPathSourceSchema = z.enum(reportProjectPathSources);
export const reportAnalysisErrorCodeSchema = z.enum(reportAnalysisErrorCodes);

export const acceptLanguageHeadersSchema = z
  .object({
    'accept-language': z.string().optional(),
  })
  .passthrough();

export const githubTokenHeadersSchema = acceptLanguageHeadersSchema.extend({
  'x-github-token': z.string().optional(),
});

export const createReportAnalysisRequestSchema = z.object({
  owner: z.string().regex(githubOwnerPattern),
  repository: z.string().regex(githubRepositoryPattern),
  normalizedUrl: z.string().url(),
  branch: z
    .string()
    .refine(isGithubBranchName)
    .transform((value) => normalizeGithubBranchName(value) ?? value)
    .nullish(),
  projectPath: z
    .string()
    .refine(isGithubProjectPath)
    .transform((value) => normalizeGithubProjectPath(value) ?? value)
    .nullish(),
  projectPathSource: z.enum(['url', 'manual']).optional(),
});

export const createReportAnalysisResponseSchema = z.object({
  id: z.string(),
  reuseReason: z.enum(['completed', 'active', 'retried']).nullable(),
  status: z.enum(['queued', 'running', 'completed']),
});

export const refreshReportAnalysisResponseSchema = z.object({
  id: z.string(),
  refreshReason: z.enum(['up_to_date', 'reused', 'created']),
  status: z.enum(['queued', 'running', 'completed']),
});

export const retryReportAnalysisResponseSchema = z.object({
  id: z.string(),
  retryReason: z.enum(['retried', 'active', 'completed']),
  status: z.enum(['queued', 'running', 'completed']),
});

export const validateGithubTokenResponseSchema = z.object({
  status: z.literal('valid'),
});

export const projectDetectionSignalSchema = z.object({
  id: z.string(),
  status: z.enum(signalStatuses),
  label: z.string(),
  description: z.string().optional(),
  source: z.string().optional(),
});

export const projectDetectionSchema = z.object({
  source: reportProjectPathSourceSchema,
  path: z.string().nullable(),
  packageJsonPath: z.string().nullable(),
  confidence: z.enum(projectDetectionConfidences),
  signals: z.array(projectDetectionSignalSchema),
});

export const reportRepositorySchema = z.object({
  owner: z.string(),
  name: z.string(),
  url: z.string().url(),
  description: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  defaultBranch: z.string(),
  branch: z.string().default(''),
  projectPath: z.string().nullable().default(null),
  projectDetection: projectDetectionSchema,
  latestCommitSha: z.string().nullable().default(null),
  latestCommitDate: z.string().nullable(),
  latestCommitTitle: z.string().nullable().default(null),
  license: z.string().nullable(),
});

export const scoringCheckSchema = z.object({
  id: z.enum(reportScoreCheckIds),
  label: z.string(),
  status: z.enum(scoringCheckStatuses),
  severity: z.enum(scoringCheckSeverities),
  scope: z.enum(scoringCheckScopes),
  confidence: z.enum(scoringCheckConfidences),
  earned: z.number().min(0),
  max: z.number().positive(),
  description: z.string().optional(),
  source: z.string().optional(),
});

export const scoreCapSchema = z.object({
  value: z.number().int().min(0).max(100),
  reason: z.string(),
  source: z.string().optional(),
});

export const scoreDetailsSchema = z.object({
  rawValue: z.number().int().min(0).max(100),
  finalValue: z.number().int().min(0).max(100),
  weight: z.number().positive(),
  impactLevel: z.enum(scoreImpactLevels),
  cap: scoreCapSchema.optional(),
  checks: z.array(scoringCheckSchema),
});

export const analysisSourceSchema = z.object({
  id: z.string(),
  kind: z.enum(analysisSourceKinds),
  scope: z.enum(analysisSourceScopes),
  status: z.enum(signalStatuses),
  label: z.string(),
  description: z.string().optional(),
  source: z.string().optional(),
});

export const toolingSourceSchema = z.object({
  raw: z.string(),
  kind: z.enum(toolingSourceKinds),
  label: z.string(),
  path: z.string().optional(),
  section: z.enum(toolingSourceSections).optional(),
  name: z.string().optional(),
  detail: z.string().optional(),
});

export const toolingItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(signalStatuses),
  sources: z.array(toolingSourceSchema),
});

export const reportToolingSchema = z.object(
  Object.fromEntries(toolingGroups.map((group) => [group, z.array(toolingItemSchema)])) as Record<
    (typeof toolingGroups)[number],
    z.ZodArray<typeof toolingItemSchema>
  >,
);

export const scoreBreakdownItemSchema = z.object({
  category: z.enum(scoreCategories),
  label: z.string(),
  value: z.number().int().min(0),
  maxValue: z.number().int().positive(),
  status: z.enum(scoreStatuses),
  description: z.string(),
  scoreDetails: scoreDetailsSchema,
});

export const reportCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(checkStatuses),
  description: z.string().optional(),
});

export const reportRecommendationSchema = z.object({
  id: z.string(),
  severity: z.enum(recommendationSeverities),
  title: z.string(),
  description: z.string(),
});

export const projectReportSchema = z.object({
  id: z.string(),
  repository: reportRepositorySchema,
  analysisSources: z.array(analysisSourceSchema),
  tooling: reportToolingSchema,
  totalScore: z.number().int().min(0).max(100),
  scoreBreakdown: z.array(scoreBreakdownItemSchema),
  checks: z.array(reportCheckSchema),
  recommendations: z.array(reportRecommendationSchema),
  createdAt: z.string(),
});

export const reportAnalysisProgressSchema = z.object({
  stage: reportAnalysisProgressStageSchema,
  updatedAt: z.string(),
});

export const reportAnalysisProcessingSummarySchema = z.object({
  owner: z.string(),
  repository: z.string(),
  normalizedUrl: z.string().url(),
  branch: z.string(),
  projectPath: z.string().nullable(),
  latestCommitDate: z.string().nullable(),
  latestCommitSha: z.string().nullable(),
  latestCommitTitle: z.string().nullable(),
  progress: reportAnalysisProgressSchema,
  startedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const reportAnalysisQueuedResponseSchema = z.object({
  id: z.string(),
  status: z.literal('queued'),
  analysis: reportAnalysisProcessingSummarySchema,
});

export const reportAnalysisRunningResponseSchema = z.object({
  id: z.string(),
  status: z.literal('running'),
  analysis: reportAnalysisProcessingSummarySchema,
});

export const reportAnalysisCompletedResponseSchema = z.object({
  id: z.string(),
  status: z.literal('completed'),
  report: projectReportSchema,
});

export const reportAnalysisFailedResponseSchema = z.object({
  id: z.string(),
  status: z.literal('failed'),
  errorCode: reportAnalysisErrorCodeSchema,
  errorMessage: z.string(),
});

export const getReportAnalysisResponseSchema = z.discriminatedUnion('status', [
  reportAnalysisQueuedResponseSchema,
  reportAnalysisRunningResponseSchema,
  reportAnalysisCompletedResponseSchema,
  reportAnalysisFailedResponseSchema,
]);

export const reportAnalysisListItemSchema = z.object({
  id: z.string(),
  owner: z.string(),
  repository: z.string(),
  normalizedUrl: z.string().url(),
  branch: z.string(),
  projectPath: z.string().nullable(),
  status: reportAnalysisStatusSchema,
  latestCommitDate: z.string().nullable(),
  latestCommitSha: z.string().nullable(),
  latestCommitTitle: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  score: z.number().int().min(0).max(100).optional(),
  metricsCount: z.number().int().nonnegative().optional(),
  checksCount: z.number().int().nonnegative().optional(),
  recommendationsCount: z.number().int().nonnegative().optional(),
});

export const listReportAnalysesResponseSchema = z.object({
  items: z.array(reportAnalysisListItemSchema),
});

export const repositoryBranchesParamsSchema = z.object({
  owner: z.string().regex(githubOwnerPattern),
  repository: z.string().regex(githubRepositoryPattern),
});

export const repositoryBranchSchema = z.object({
  name: z.string(),
  isDefault: z.boolean(),
});

export const listRepositoryBranchesResponseSchema = z.object({
  defaultBranch: z.string(),
  branches: z.array(repositoryBranchSchema),
  isTruncated: z.boolean(),
});

export const reportComparisonValueSchema = z.object({
  current: z.number().int(),
  previous: z.number().int(),
  delta: z.number().int(),
});

export const reportComparisonMetricSchema = z.object({
  category: z.enum(scoreCategories),
  label: z.string(),
  currentValue: z.number().int(),
  previousValue: z.number().int(),
  delta: z.number().int(),
  currentStatus: z.enum(scoreStatuses),
  previousStatus: z.enum(scoreStatuses),
});

export const reportComparisonCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  previousStatus: z.enum(checkStatuses),
  currentStatus: z.enum(checkStatuses),
});

export const reportComparisonRecommendationsSchema = z.object({
  added: z.array(reportRecommendationSchema),
  resolved: z.array(reportRecommendationSchema),
  persistentCount: z.number().int().nonnegative(),
});

export const reportComparisonUnavailableResponseSchema = z.object({
  status: z.literal('unavailable'),
});

export const reportComparisonAvailableResponseSchema = z.object({
  status: z.literal('available'),
  currentReportId: z.string(),
  previousReportId: z.string(),
  totalScore: reportComparisonValueSchema,
  metrics: z.array(reportComparisonMetricSchema),
  checks: z.array(reportComparisonCheckSchema),
  recommendations: reportComparisonRecommendationsSchema,
});

export const getReportComparisonResponseSchema = z.discriminatedUnion('status', [
  reportComparisonUnavailableResponseSchema,
  reportComparisonAvailableResponseSchema,
]);

export const reportAnalysisParamsSchema = z.object({
  id: z.string().min(1),
});

export const getReportComparisonQuerySchema = z.object({
  previousId: z.string().min(1).optional(),
});

export const errorResponseSchema = z.object({
  code: reportAnalysisErrorCodeSchema.optional(),
  message: z.string(),
});

export type CreateReportAnalysisRequest = z.infer<typeof createReportAnalysisRequestSchema>;
export type CreateReportAnalysisResponse = z.infer<typeof createReportAnalysisResponseSchema>;
export type GetReportComparisonResponse = z.infer<typeof getReportComparisonResponseSchema>;
export type GetReportAnalysisResponse = z.infer<typeof getReportAnalysisResponseSchema>;
export type ListReportAnalysesResponse = z.infer<typeof listReportAnalysesResponseSchema>;
export type ListRepositoryBranchesResponse = z.infer<typeof listRepositoryBranchesResponseSchema>;
export type ReportAnalysisErrorCode = z.infer<typeof reportAnalysisErrorCodeSchema>;
export type ReportAnalysisProgressStage = z.infer<typeof reportAnalysisProgressStageSchema>;
export type ProjectReport = z.infer<typeof projectReportSchema>;
export type ReportAnalysisStatus = z.infer<typeof reportAnalysisStatusSchema>;
export type ReportProjectPathSource = z.infer<typeof reportProjectPathSourceSchema>;
export type RefreshReportAnalysisResponse = z.infer<typeof refreshReportAnalysisResponseSchema>;
export type RetryReportAnalysisResponse = z.infer<typeof retryReportAnalysisResponseSchema>;
export type ValidateGithubTokenResponse = z.infer<typeof validateGithubTokenResponseSchema>;
