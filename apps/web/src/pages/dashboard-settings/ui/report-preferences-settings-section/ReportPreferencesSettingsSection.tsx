import { BarChart3, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/shared/ui/Card';
import { Checkbox } from '@/shared/ui/Checkbox';

import s from './ReportPreferencesSettingsSection.module.scss';

import type { ReportMetricPreferenceOption } from '../../model/reportPreferencesTypes';
import type { ScoreCategory } from '@/entities/report';

interface ReportPreferencesSettingsSectionProps {
  isReportHistoryEnabled: boolean;
  metricOptions: ReportMetricPreferenceOption[];
  onReportHistoryEnabledChange: (isEnabled: boolean) => void;
  onToggleMetricCategory: (category: ScoreCategory) => void;
}

export const ReportPreferencesSettingsSection = ({
  isReportHistoryEnabled,
  metricOptions,
  onReportHistoryEnabledChange,
  onToggleMetricCategory,
}: ReportPreferencesSettingsSectionProps) => {
  const { t } = useTranslation('settings');

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
          onChange={(event) => onReportHistoryEnabledChange(event.target.checked)}
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
          {metricOptions.map(({ category, hintKey, isDisabled, isEnabled, labelKey }) => {
            return (
              <Checkbox
                checked={isEnabled}
                disabled={isDisabled}
                hint={t(hintKey)}
                key={category}
                label={t(labelKey)}
                onChange={() => onToggleMetricCategory(category)}
                wrapperClassName={s.metricCheckbox}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
};
