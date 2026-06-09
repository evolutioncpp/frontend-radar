import { useListReportAnalysesQuery } from './reportApi';
import { getReportHistoryItemViewModel } from './reportSelectors';

export const useReportHistory = (language: string) => {
  const query = useListReportAnalysesQuery();

  return {
    ...query,
    items: query.data?.items.map((item) => getReportHistoryItemViewModel(item, language)) ?? [],
  };
};
