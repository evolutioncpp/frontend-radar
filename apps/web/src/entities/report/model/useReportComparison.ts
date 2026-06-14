import { useGetReportComparisonQuery } from './reportApi';

import type { GetReportComparisonApiArg } from './reportApi';
import type { AvailableReportComparison, UnavailableReportComparison } from './types';

export type ReportComparisonState =
  | {
      status: 'available';
      comparison: AvailableReportComparison;
    }
  | {
      status: 'unavailable';
      comparison: UnavailableReportComparison;
    }
  | {
      status: 'hidden';
    };

export const useReportComparison = (
  reportId?: string,
  previousReportId?: string | null,
): ReportComparisonState => {
  const queryArg: GetReportComparisonApiArg = {
    id: reportId ?? '',
    ...(previousReportId ? { previousId: previousReportId } : {}),
  };
  const { data, isError, isLoading } = useGetReportComparisonQuery(queryArg, {
    skip: !reportId,
  });

  if (isLoading || isError || !data) {
    return {
      status: 'hidden',
    };
  }

  if (data.status === 'unavailable') {
    return {
      status: 'unavailable',
      comparison: data,
    };
  }

  return {
    status: 'available',
    comparison: data,
  };
};
