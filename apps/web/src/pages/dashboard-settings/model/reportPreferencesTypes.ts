import type { ScoreCategory } from '@/entities/report';
import type {
  ReportScoreCategoryHintKey,
  ReportScoreCategoryLabelKey,
} from '@/features/app-settings/model/appSettingsTypes';

export type ReportMetricPreferenceOption = {
  category: ScoreCategory;
  hintKey: ReportScoreCategoryHintKey | 'reportPreferences.metrics.lastEnabledHint';
  isDisabled: boolean;
  isEnabled: boolean;
  labelKey: ReportScoreCategoryLabelKey;
};
