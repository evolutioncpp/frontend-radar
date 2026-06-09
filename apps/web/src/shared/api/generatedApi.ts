import { baseApi as api } from './baseApi';

export const addTagTypes = ['System', 'Reports'] as const;
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
  };
};
export type ListReportAnalysesApiResponse = /** status 200 Default Response */ {
  items: {
    id: string;
    owner: string;
    repository: string;
    normalizedUrl: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    latestCommitDate: string | null;
    latestCommitSha: string | null;
    createdAt: string;
    updatedAt: string;
    score?: number;
    metricsCount?: number;
    checksCount?: number;
    recommendationsCount?: number;
  }[];
};
export type ListReportAnalysesApiArg = void;
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
          latestCommitSha: string | null;
          latestCommitDate: string | null;
          license: string | null;
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
  useCreateReportAnalysisMutation,
  useListReportAnalysesQuery,
  useLazyListReportAnalysesQuery,
  useGetReportAnalysisQuery,
  useLazyGetReportAnalysisQuery,
} = injectedRtkApi;
