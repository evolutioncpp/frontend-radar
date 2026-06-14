import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';

import pageStyles from './DashboardPage.module.scss';
import s from './DashboardPageSkeleton.module.scss';
import { analysisInfoSteps } from '../model/analysisInfoSteps';

const stepDescriptionWidths = [
  ['min(100%, 50rem)', 'min(100%, 34rem)'],
  ['min(100%, 48rem)', 'min(100%, 42rem)'],
  ['min(100%, 50rem)', 'min(100%, 39rem)'],
  ['min(100%, 48rem)', 'min(100%, 36rem)'],
] as const;

const detailLineWidths = ['8rem', '10rem', '9rem', '7.5rem'] as const;

export const DashboardPageSkeleton = () => {
  return (
    <>
      <span className={s.status} role="status">
        Loading dashboard page
      </span>

      <div aria-hidden="true" className={pageStyles.dashboardPage}>
        <Card className={s.repositoryPanel}>
          <section className={s.repositoryHeader}>
            <Skeleton borderRadius="999px" height="0.75rem" width="8.5rem" />
            <Skeleton className={s.repositoryTitleLine} borderRadius="999px" />

            <div className={s.repositoryDescriptionLines}>
              <Skeleton className={s.repositoryDescriptionLine} borderRadius="999px" />
              <Skeleton borderRadius="999px" height="1rem" width="12rem" />
            </div>
          </section>

          <div className={s.formPreview}>
            <div className={s.fieldsPreview}>
              <div className={s.inputPreview}>
                <div className={s.labelPreviewLine}>
                  <Skeleton borderRadius="999px" height="0.875rem" width="5.75rem" />
                </div>

                <div className={s.inputControlPreview}>
                  <Skeleton className={s.inputIconPreview} borderRadius="0.25rem" />
                  <Skeleton borderRadius="999px" height="1rem" width="min(100%, 14.5rem)" />
                </div>

                <div className={s.hintPreviewLine}>
                  <Skeleton borderRadius="999px" height="0.875rem" width="min(100%, 29rem)" />
                </div>
              </div>

              <div className={s.togglePreview}>
                <Skeleton className={s.checkboxPreview} borderRadius="0.375rem" />

                <div className={s.toggleTextPreview}>
                  <div className={s.labelPreviewLine}>
                    <Skeleton borderRadius="999px" height="0.875rem" width="10rem" />
                  </div>

                  <div className={s.toggleHintPreviewLine}>
                    <Skeleton borderRadius="999px" height="0.875rem" width="min(100%, 21rem)" />
                  </div>
                </div>
              </div>
            </div>

            <Skeleton className={s.submitPreview} borderRadius="0.5rem" />
          </div>
        </Card>

        <Card className={pageStyles.analysisInfoCard}>
          <div className={pageStyles.analysisInfoHeader}>
            <Skeleton className={s.analysisInfoTitleLine} borderRadius="999px" />

            <div className={s.analysisInfoDescriptionLines}>
              <Skeleton className={s.analysisInfoDescriptionLine} borderRadius="999px" />
              <Skeleton borderRadius="999px" height="1rem" width="min(100%, 35rem)" />
            </div>
          </div>

          <ol className={pageStyles.analysisSteps}>
            {analysisInfoSteps.map((step, stepIndex) => (
              <li
                className={pageStyles.analysisStep}
                data-testid="dashboard-page-skeleton-step"
                key={step.titleKey}
              >
                <Skeleton className={s.stepNumberLine} borderRadius="999px" />

                <div className={pageStyles.analysisStepText}>
                  <div className={s.stepTitleLineBox}>
                    <Skeleton borderRadius="999px" height="1rem" width="min(100%, 19rem)" />
                  </div>

                  <div className={s.stepDescriptionLines}>
                    {stepDescriptionWidths[stepIndex].map((width) => (
                      <Skeleton borderRadius="999px" height="1rem" key={width} width={width} />
                    ))}
                  </div>
                </div>

                <div className={pageStyles.analysisStepDetails}>
                  <div className={s.stepDetailsTitleLineBox}>
                    <Skeleton borderRadius="999px" height="0.875rem" width="8.5rem" />
                  </div>

                  <ul className={pageStyles.analysisStepDetailsList}>
                    {step.detailItemKeys.map((detailItemKey, detailIndex) => (
                      <li className={s.detailLineBox} key={detailItemKey}>
                        <Skeleton
                          borderRadius="999px"
                          height="0.875rem"
                          width={detailLineWidths[detailIndex]}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
};
