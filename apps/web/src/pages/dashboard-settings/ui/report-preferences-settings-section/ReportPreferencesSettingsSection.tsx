import { BarChart3, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  selectEnabledScoreCategories,
  selectIsReportHistoryEnabled,
} from '@/features/app-settings/model/appSettingsSelectors';
import {
  setReportHistoryEnabled,
  toggleEnabledScoreCategory,
} from '@/features/app-settings/model/appSettingsSlice';
import { reportScoreCategoryOptions } from '@/features/app-settings/model/appSettingsTypes';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';
import { Card } from '@/shared/ui/Card';
import { Checkbox } from '@/shared/ui/Checkbox';

import s from './ReportPreferencesSettingsSection.module.scss';

import type { ScoreCategory } from '@/entities/report';

export const ReportPreferencesSettingsSection = () => {
  const { t } = useTranslation('settings');
  const dispatch = useAppDispatch();
  const isReportHistoryEnabled = useAppSelector(selectIsReportHistoryEnabled);
  const enabledScoreCategories = useAppSelector(selectEnabledScoreCategories);
  const enabledCategoryCount = enabledScoreCategories.length;

  const isCategoryEnabled = (category: ScoreCategory) => {
    return enabledScoreCategories.includes(category);
  };

  return (
    <Card className={s.section} variant="flat">
      <div className={s.sectionHeader}>
        <span className={s.sectionIcon} aria-hidden="true">
          <History />
        </span>
        <div>
          <h2 className={s.sectionTitle}>{t('reportPreferences.title')}</h2>
          <p className={s.sectionDescription}>{t('reportPreferences.description')}</p>
        </div>
      </div>

      <div className={s.block}>
        <Checkbox
          checked={isReportHistoryEnabled}
          hint={t('reportPreferences.history.hint')}
          label={t('reportPreferences.history.label')}
          onChange={(event) => dispatch(setReportHistoryEnabled(event.target.checked))}
        />
      </div>

      <div className={s.block}>
        <div className={s.blockHeader}>
          <span className={s.blockIcon} aria-hidden="true">
            <BarChart3 />
          </span>
          <div>
            <h3 className={s.blockTitle}>{t('reportPreferences.metrics.title')}</h3>
            <p className={s.blockDescription}>{t('reportPreferences.metrics.description')}</p>
          </div>
        </div>

        <div className={s.metricsList}>
          {reportScoreCategoryOptions.map((category) => {
            const isEnabled = isCategoryEnabled(category);
            const isLastEnabled = isEnabled && enabledCategoryCount <= 1;

            return (
              <Checkbox
                checked={isEnabled}
                disabled={isLastEnabled}
                hint={
                  isLastEnabled
                    ? t('reportPreferences.metrics.lastEnabledHint')
                    : t(`reportPreferences.metrics.categoryHints.${category}`)
                }
                key={category}
                label={t(`reportPreferences.metrics.categories.${category}`)}
                onChange={() => dispatch(toggleEnabledScoreCategory(category))}
                wrapperClassName={s.metricCheckbox}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
};
