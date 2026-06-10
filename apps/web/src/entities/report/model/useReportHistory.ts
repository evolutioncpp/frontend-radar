import { useListReportAnalysesQuery } from './reportApi';
import { getReportHistoryGroupsViewModel, getReportHistoryItemViewModel } from './reportSelectors';

export const useReportHistory = (language: string) => {
  const query = useListReportAnalysesQuery();
  const items = query.data?.items ?? [];

  return {
    ...query,
    groups: getReportHistoryGroupsViewModel(items, language),
    items: items.map((item) => getReportHistoryItemViewModel(item, language)),
  };
};
