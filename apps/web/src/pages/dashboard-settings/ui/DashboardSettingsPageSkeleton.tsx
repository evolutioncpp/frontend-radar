import { reportScoreCategoryOptions } from '@/features/app-settings';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';

import pageStyles from './DashboardSettingsPage.module.scss';
import s from './DashboardSettingsPageSkeleton.module.scss';
import githubStyles from './github-token-settings-section/GithubTokenSettingsSection.module.scss';
import preferencesStyles from './report-preferences-settings-section/ReportPreferencesSettingsSection.module.scss';

const metricRows = [
  { labelWidth: '8.75rem', hintWidth: 'min(100%, 18rem)' },
  { labelWidth: '6.75rem', hintWidth: 'min(100%, 16rem)' },
  { labelWidth: '4rem', hintWidth: 'min(100%, 17.5rem)' },
  { labelWidth: '7.75rem', hintWidth: 'min(100%, 18.5rem)' },
  { labelWidth: '7rem', hintWidth: 'min(100%, 16.5rem)' },
  { labelWidth: '10.25rem', hintWidth: 'min(100%, 18rem)' },
  { labelWidth: '8.5rem', hintWidth: 'min(100%, 17rem)' },
  { labelWidth: '8rem', hintWidth: 'min(100%, 16rem)' },
] as const;

export const DashboardSettingsPageSkeleton = () => {
  return (
    <>
      <span className={s.status} role="status">
        Loading dashboard settings
      </span>

      <div aria-hidden="true" className={`${pageStyles.page} ${s.visualRoot}`}>
        <div className={pageStyles.header}>
          <Skeleton className={s.headerEyebrowLine} borderRadius="999px" />
          <Skeleton className={s.headerTitleLine} borderRadius="999px" />
          <Skeleton className={s.headerDescriptionLine} borderRadius="999px" />
        </div>

        <Card className={githubStyles.section} data-testid="dashboard-settings-skeleton-card">
          <div className={githubStyles.sectionHeader}>
            <div className={`${githubStyles.sectionHeaderMain} ${s.sectionHeaderMainPreview}`}>
              <Skeleton className={s.sectionIconLine} borderRadius="0.5rem" />

              <div className={s.sectionHeaderText}>
                <Skeleton className={s.githubTitleLine} borderRadius="999px" />

                <div className={s.sectionDescriptionLines}>
                  <Skeleton className={s.githubDescriptionLine} borderRadius="999px" />
                  <Skeleton borderRadius="999px" height="1rem" width="min(100%, 28rem)" />
                </div>
              </div>
            </div>

            <Skeleton className={s.helpButtonLine} borderRadius="0.5rem" />
          </div>

          <div className={githubStyles.tokenStatus}>
            <Skeleton className={s.tokenStatusIconLine} borderRadius="0.375rem" />

            <div className={s.blockText}>
              <Skeleton className={s.tokenStatusTitleLine} borderRadius="999px" />

              <div className={s.tokenStatusDescriptionLines}>
                <Skeleton className={s.tokenStatusDescriptionLine} borderRadius="999px" />
                <Skeleton borderRadius="999px" height="0.875rem" width="min(100%, 24rem)" />
              </div>
            </div>
          </div>

          <div className={githubStyles.form}>
            <div className={s.textInputPreview}>
              <Skeleton className={s.inputLabelLine} borderRadius="999px" />

              <div className={s.inputControlLine}>
                <Skeleton className={s.inputIconLine} borderRadius="0.25rem" />
                <Skeleton borderRadius="999px" height="1rem" width="min(100%, 10rem)" />
              </div>

              <Skeleton className={s.inputHintLine} borderRadius="999px" />
            </div>

            <div className={githubStyles.actions}>
              <Skeleton className={s.primaryActionLine} borderRadius="0.5rem" />
              <Skeleton className={s.ghostActionLine} borderRadius="0.5rem" />
            </div>
          </div>
        </Card>

        <Card className={preferencesStyles.section} data-testid="dashboard-settings-skeleton-card">
          <div className={preferencesStyles.sectionHeader}>
            <Skeleton className={s.sectionIconLine} borderRadius="0.5rem" />

            <div className={s.sectionHeaderText}>
              <Skeleton className={s.preferencesTitleLine} borderRadius="999px" />

              <div className={s.sectionDescriptionLines}>
                <Skeleton className={s.preferencesDescriptionLine} borderRadius="999px" />
                <Skeleton borderRadius="999px" height="1rem" width="min(100%, 27rem)" />
              </div>
            </div>
          </div>

          <div className={preferencesStyles.block}>
            <div className={s.checkboxPreview}>
              <Skeleton className={s.checkboxLine} borderRadius="0.375rem" />

              <div className={s.checkboxText}>
                <Skeleton className={s.historyLabelLine} borderRadius="999px" />
                <Skeleton className={s.historyHintLine} borderRadius="999px" />
              </div>
            </div>
          </div>

          <div className={preferencesStyles.block}>
            <div className={preferencesStyles.blockHeader}>
              <Skeleton className={s.blockIconLine} borderRadius="0.375rem" />

              <div className={s.blockText}>
                <Skeleton className={s.metricsTitleLine} borderRadius="999px" />

                <div className={s.blockDescriptionLines}>
                  <Skeleton className={s.metricsDescriptionLine} borderRadius="999px" />
                  <Skeleton borderRadius="999px" height="1rem" width="min(100%, 30rem)" />
                </div>
              </div>
            </div>

            <div className={preferencesStyles.metricsList}>
              {reportScoreCategoryOptions.map((category, index) => {
                const row = metricRows[index % metricRows.length];

                return (
                  <div
                    className={s.metricRow}
                    data-testid="dashboard-settings-skeleton-metric"
                    key={category}
                  >
                    <Skeleton className={s.checkboxLine} borderRadius="0.375rem" />

                    <div className={s.checkboxText}>
                      <Skeleton borderRadius="999px" height="0.875rem" width={row.labelWidth} />
                      <Skeleton borderRadius="999px" height="0.875rem" width={row.hintWidth} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
