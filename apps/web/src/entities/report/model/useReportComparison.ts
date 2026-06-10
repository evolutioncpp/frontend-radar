import { useGetReportComparisonQuery } from './reportApi';

import type { GetReportComparisonApiResponse } from './reportApi';

type AvailableReportComparison = Extract<
  GetReportComparisonApiResponse,
  {
    status: 'available';
  }
>;

export type ReportComparisonState =
  | {
      status: 'available';
      comparison: AvailableReportComparison;
    }
  | {
      status: 'hidden';
    };

export const useReportComparison = (reportId?: string): ReportComparisonState => {
  const { data, isError, isLoading } = useGetReportComparisonQuery(
    {
      id: reportId ?? '',
    },
    {
      skip: !reportId,
    },
  );

  if (isLoading || isError || data?.status !== 'available') {
    return {
      status: 'hidden',
    };
  }

  return {
    status: 'available',
    comparison: data,
  };
};
