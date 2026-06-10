import { baseApi as api } from './baseApi';

export const addTagTypes = ['System', 'Repositories', 'Reports'] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
        query: () => ({ url: `/health` }),
        providesTags: ['System'],
      }),
      listRepositoryBranches: build.query<
        ListRepositoryBranchesApiResponse,
        ListRepositoryBranchesApiArg
      >({
        query: (queryArg) => ({
          url: `/repositories/${queryArg.owner}/${queryArg.repository}/branches`,
        }),
        providesTags: ['Repositories'],
      }),
      createReportAnalysis: build.mutation<
        CreateReportAnalysisApiResponse,
        CreateReportAnalysisApiArg
      >({
        query: (queryArg) => ({ url: `/reports/analyze`, method: 'POST', body: queryArg.body }),
        invalidatesTags: ['Reports'],
      }),
      listReportAnalyses: build.query<ListReportAnalysesApiResponse, ListReportAnalysesApiArg>({
        query: () => ({ url: `/reports` }),
        providesTags: ['Reports'],
      }),
      forceRefreshReportAnalysis: build.mutation<
        ForceRefreshReportAnalysisApiResponse,
        ForceRefreshReportAnalysisApiArg
      >({
        query: (queryArg) => ({ url: `/reports/${queryArg.id}/refresh`, method: 'POST' }),
        invalidatesTags: ['Reports'],
      }),
      getReportComparison: build.query<GetReportComparisonApiResponse, GetReportComparisonApiArg>({
        query: (queryArg) => ({
          url: `/reports/${queryArg.id}/comparison`,
          params: {
            previousId: queryArg.previousId,
          },
        }),
        providesTags: ['Reports'],
      }),
      getReportAnalysis: build.query<GetReportAnalysisApiResponse, GetReportAnalysisApiArg>({
        query: (queryArg) => ({ url: `/reports/${queryArg.id}` }),
        providesTags: ['Reports'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type GetHealthApiResponse = /** status 200 Default Response */ {
  status: 'ok';
};
export type GetHealthApiArg = void;
export type ListRepositoryBranchesApiResponse = /** status 200 Default Response */ {
  defaultBranch: string;
  branches: {
    name: string;
    isDefault: boolean;
  }[];
  isTruncated: boolean;
};
export type ListRepositoryBranchesApiArg = {
  owner: string;
  repository: string;
};
export type CreateReportAnalysisApiResponse =
  /** status 200 Default Response */
  {
    id: string;
    reuseReason: ('completed' | 'active' | 'retried') | null;
    status: 'queued' | 'running' | 'completed';
  };
/** status 201 Default Response */
export type CreateReportAnalysisApiArg = {
  body: {
    owner: string;
    repository: string;
    normalizedUrl: string;
    branch?: string | null;
    projectPath?: string | null;
    projectPathSource?: 'url' | 'manual';
  };
};
export type ListReportAnalysesApiResponse = /** status 200 Default Response */ {
  items: {
    id: string;
    owner: string;
    repository: string;
    normalizedUrl: string;
    branch: string;
    projectPath: string | null;
    status: 'queued' | 'running' | 'completed' | 'failed';
    latestCommitDate: string | null;
    latestCommitSha: string | null;
    latestCommitTitle: string | null;
    createdAt: string;
    updatedAt: string;
    score?: number;
    metricsCount?: number;
    checksCount?: number;
    recommendationsCount?: number;
  }[];
};
export type ListReportAnalysesApiArg = void;
export type ForceRefreshReportAnalysisApiResponse =
  /** status 200 Default Response */
  {
    id: string;
    refreshReason: 'up_to_date' | 'reused' | 'created';
    status: 'queued' | 'running' | 'completed';
  };
/** status 201 Default Response */
export type ForceRefreshReportAnalysisApiArg = {
  id: string;
};
export type GetReportComparisonApiResponse =
  /** status 200 Default Response */
  | {
      status: 'unavailable';
    }
  | {
      status: 'available';
      currentReportId: string;
      previousReportId: string;
      totalScore: {
        current: number;
        previous: number;
        delta: number;
      };
      metrics: {
        category:
          | 'documentation'
          | 'testing'
          | 'ci'
          | 'dependencies'
          | 'maintainability'
          | 'performance'
          | 'accessibility';
        label: string;
        currentValue: number;
        previousValue: number;
        delta: number;
        currentStatus: 'excellent' | 'good' | 'warning' | 'critical';
        previousStatus: 'excellent' | 'good' | 'warning' | 'critical';
      }[];
      checks: {
        id: string;
        label: string;
        previousStatus: 'passed' | 'failed' | 'warning';
        currentStatus: 'passed' | 'failed' | 'warning';
      }[];
      recommendations: {
        added: {
          id: string;
          severity: 'low' | 'medium' | 'high';
          title: string;
          description: string;
        }[];
        resolved: {
          id: string;
          severity: 'low' | 'medium' | 'high';
          title: string;
          description: string;
        }[];
        persistentCount: number;
      };
    };
export type GetReportComparisonApiArg = {
  previousId?: string;
  id: string;
};
export type GetReportAnalysisApiResponse =
  /** status 200 Default Response */
  | {
      id: string;
      status: 'queued';
    }
  | {
      id: string;
      status: 'running';
    }
  | {
      id: string;
      status: 'completed';
      report: {
        id: string;
        repository: {
          owner: string;
          name: string;
          url: string;
          description: string | null;
          stars: number;
          forks: number;
          defaultBranch: string;
          branch: string;
          projectPath: string | null;
          projectDetection: {
            source: 'autodetect' | 'url' | 'manual';
            path: string | null;
            packageJsonPath: string | null;
            confidence: 'high' | 'medium' | 'low';
            signals: {
              id: string;
              status: 'found' | 'missing' | 'warning';
              label: string;
              description?: string;
              source?: string;
            }[];
          };
          latestCommitSha: string | null;
          latestCommitDate: string | null;
          latestCommitTitle: string | null;
          license: string | null;
        };
        analysisSources: {
          id: string;
          kind:
            | 'github_api'
            | 'file'
            | 'directory'
            | 'package_json'
            | 'script'
            | 'dependency'
            | 'workflow';
          scope: 'repository' | 'root' | 'project' | 'github';
          status: 'found' | 'missing' | 'warning';
          label: string;
          description?: string;
          source?: string;
        }[];
        tooling: {
          packageManager: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
          frameworks: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
          bundlers: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
          testing: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
          linting: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
          formatting: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
          typing: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
          uiReview: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
          accessibility: {
            id: string;
            label: string;
            status: 'found' | 'missing' | 'warning';
            sources: string[];
          }[];
        };
        totalScore: number;
        scoreBreakdown: {
          category:
            | 'documentation'
            | 'testing'
            | 'ci'
            | 'dependencies'
            | 'maintainability'
            | 'performance'
            | 'accessibility';
          label: string;
          value: number;
          maxValue: number;
          status: 'excellent' | 'good' | 'warning' | 'critical';
          description: string;
          evidence: {
            id: string;
            status: 'found' | 'missing' | 'warning';
            label: string;
            description?: string;
            source?: string;
          }[];
        }[];
        checks: {
          id: string;
          label: string;
          status: 'passed' | 'failed' | 'warning';
          description?: string;
        }[];
        recommendations: {
          id: string;
          severity: 'low' | 'medium' | 'high';
          title: string;
          description: string;
        }[];
        createdAt: string;
      };
    }
  | {
      id: string;
      status: 'failed';
      errorCode:
        | 'repository_not_found'
        | 'repository_forbidden'
        | 'github_rate_limited'
        | 'github_unavailable'
        | 'branch_not_found'
        | 'project_path_not_found'
        | 'repository_verification_failed'
        | 'analysis_failed';
      errorMessage: string;
    };
export type GetReportAnalysisApiArg = {
  id: string;
};
export const {
  useGetHealthQuery,
  useLazyGetHealthQuery,
  useListRepositoryBranchesQuery,
  useLazyListRepositoryBranchesQuery,
  useCreateReportAnalysisMutation,
  useListReportAnalysesQuery,
  useLazyListReportAnalysesQuery,
  useForceRefreshReportAnalysisMutation,
  useGetReportComparisonQuery,
  useLazyGetReportComparisonQuery,
  useGetReportAnalysisQuery,
  useLazyGetReportAnalysisQuery,
} = injectedRtkApi;
