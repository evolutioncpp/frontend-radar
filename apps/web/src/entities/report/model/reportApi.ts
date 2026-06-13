import { generatedApi } from '@/shared/api/generatedApi';

export {
  useListReportAnalysesQuery,
  useLazyListReportAnalysesQuery,
  useGetReportComparisonQuery,
  useLazyGetReportComparisonQuery,
  useGetReportAnalysisQuery,
  useLazyGetReportAnalysisQuery,
} from '@/shared/api/generatedApi';

export const invalidateReportsCache = () => generatedApi.util.invalidateTags(['Reports']);

export type {
  GetReportComparisonApiArg,
  GetReportComparisonApiResponse,
  GetReportAnalysisApiArg,
  GetReportAnalysisApiResponse,
  ListReportAnalysesApiArg,
  ListReportAnalysesApiResponse,
} from '@/shared/api/generatedApi';
