import { useTranslation } from 'react-i18next';

import s from './DashboardSettingsPage.module.scss';
import { GithubTokenSettingsSection } from './github-token-settings-section/GithubTokenSettingsSection';
import { ReportPreferencesSettingsSection } from './report-preferences-settings-section/ReportPreferencesSettingsSection';
import { useReportPreferencesSettings } from '../model/useReportPreferencesSettings';

export const DashboardSettingsPage = () => {
  const { t } = useTranslation('settings');
  const reportPreferencesSettings = useReportPreferencesSettings();

  return (
    <div className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>{t('page.label')}</p>
        <h1 className={s.title}>{t('page.title')}</h1>
        <p className={s.description}>{t('page.description')}</p>
      </div>

      <GithubTokenSettingsSection />
      <ReportPreferencesSettingsSection
        isReportHistoryEnabled={reportPreferencesSettings.isReportHistoryEnabled}
        metricOptions={reportPreferencesSettings.metricOptions}
        onReportHistoryEnabledChange={reportPreferencesSettings.setReportHistoryEnabled}
        onToggleMetricCategory={reportPreferencesSettings.toggleMetricCategory}
      />
    </div>
  );
};
