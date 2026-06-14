import {
  selectEnabledScoreCategories,
  selectIsReportHistoryEnabled,
} from '@/features/app-settings/model/appSettingsSelectors';
import {
  setReportHistoryEnabled,
  toggleEnabledScoreCategory,
} from '@/features/app-settings/model/appSettingsSlice';
import {
  reportScoreCategoryOptionMap,
  reportScoreCategoryOptions,
} from '@/features/app-settings/model/appSettingsTypes';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';

import type { ReportMetricPreferenceOption } from './reportPreferencesTypes';
import type { ScoreCategory } from '@/entities/report';

export const useReportPreferencesSettings = () => {
  const dispatch = useAppDispatch();
  const isReportHistoryEnabled = useAppSelector(selectIsReportHistoryEnabled);
  const enabledScoreCategories = useAppSelector(selectEnabledScoreCategories);
  const enabledCategoryCount = enabledScoreCategories.length;

  const metricOptions: ReportMetricPreferenceOption[] = reportScoreCategoryOptions.map(
    (category) => {
      const isEnabled = enabledScoreCategories.includes(category);
      const isDisabled = isEnabled && enabledCategoryCount <= 1;
      const option = reportScoreCategoryOptionMap[category];

      return {
        category,
        hintKey: isDisabled ? 'reportPreferences.metrics.lastEnabledHint' : option.hintKey,
        isDisabled,
        isEnabled,
        labelKey: option.labelKey,
      };
    },
  );

  return {
    isReportHistoryEnabled,
    metricOptions,
    setReportHistoryEnabled: (isEnabled: boolean) => {
      dispatch(setReportHistoryEnabled(isEnabled));
    },
    toggleMetricCategory: (category: ScoreCategory) => {
      dispatch(toggleEnabledScoreCategory(category));
    },
  };
};
