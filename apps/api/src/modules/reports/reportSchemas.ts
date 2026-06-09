import { z } from 'zod/v4';
import { githubOwnerPattern, githubRepositoryPattern } from '@frontend-radar/github-repository';

export const reportAnalysisStatuses = ['queued', 'running', 'completed', 'failed'] as const;
export const reportAnalysisErrorCodes = [
  'repository_not_found',
  'repository_forbidden',
  'github_rate_limited',
  'github_unavailable',
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
export const recommendationSeverities = ['low', 'medium', 'high'] as const;

export const reportAnalysisStatusSchema = z.enum(reportAnalysisStatuses);
export const reportAnalysisErrorCodeSchema = z.enum(reportAnalysisErrorCodes);

export const createReportAnalysisRequestSchema = z.object({
  owner: z.string().regex(githubOwnerPattern),
  repository: z.string().regex(githubRepositoryPattern),
  normalizedUrl: z.string().url(),
});

export const createReportAnalysisResponseSchema = z.object({
  id: z.string(),
  reuseReason: z.enum(['completed', 'active', 'retried']).nullable(),
  status: z.enum(['queued', 'running', 'completed']),
});

export const reportRepositorySchema = z.object({
  owner: z.string(),
  name: z.string(),
  url: z.string().url(),
  description: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  defaultBranch: z.string(),
  latestCommitSha: z.string().nullable().default(null),
  latestCommitDate: z.string().nullable(),
  license: z.string().nullable(),
});

export const scoreBreakdownItemSchema = z.object({
  category: z.enum(scoreCategories),
  label: z.string(),
  value: z.number().int().min(0),
  maxValue: z.number().int().positive(),
  status: z.enum(scoreStatuses),
  description: z.string(),
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
  totalScore: z.number().int().min(0).max(100),
  scoreBreakdown: z.array(scoreBreakdownItemSchema),
  checks: z.array(reportCheckSchema),
  recommendations: z.array(reportRecommendationSchema),
  createdAt: z.string(),
});

export const reportAnalysisQueuedResponseSchema = z.object({
  id: z.string(),
  status: z.literal('queued'),
});

export const reportAnalysisRunningResponseSchema = z.object({
  id: z.string(),
  status: z.literal('running'),
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
  status: reportAnalysisStatusSchema,
  latestCommitDate: z.string().nullable(),
  latestCommitSha: z.string().nullable(),
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

export const reportAnalysisParamsSchema = z.object({
  id: z.string().min(1),
});

export const errorResponseSchema = z.object({
  code: reportAnalysisErrorCodeSchema.optional(),
  message: z.string(),
});

export type CreateReportAnalysisRequest = z.infer<typeof createReportAnalysisRequestSchema>;
export type ReportAnalysisErrorCode = z.infer<typeof reportAnalysisErrorCodeSchema>;
export type ProjectReport = z.infer<typeof projectReportSchema>;
export type ReportAnalysisStatus = z.infer<typeof reportAnalysisStatusSchema>;
