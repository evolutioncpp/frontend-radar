import { reportScoreCategoryOptions } from '@/features/app-settings';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';

import pageStyles from './ReportPage.module.scss';
import s from './ReportPageSkeleton.module.scss';

const toolingRows = [
  { id: 'package-manager', titleWidth: '8rem', sourceWidth: '11rem' },
  { id: 'frameworks', titleWidth: '10rem', sourceWidth: '12rem' },
  { id: 'bundlers', titleWidth: '7rem', sourceWidth: '10rem' },
  { id: 'testing', titleWidth: '9rem', sourceWidth: '13rem' },
  { id: 'linting', titleWidth: '8.5rem', sourceWidth: '11.5rem' },
  { id: 'formatting', titleWidth: '7.5rem', sourceWidth: '10.5rem' },
  { id: 'typing', titleWidth: '9.5rem', sourceWidth: '12rem' },
  { id: 'ui-review', titleWidth: '8rem', sourceWidth: '11rem' },
  { id: 'accessibility', titleWidth: '10.5rem', sourceWidth: '13rem' },
] as const;

const metricRows = [
  { titleWidth: '8.75rem', descriptionWidth: '28rem' },
  { titleWidth: '6.75rem', descriptionWidth: '24rem' },
  { titleWidth: '4rem', descriptionWidth: '26rem' },
  { titleWidth: '7.75rem', descriptionWidth: '30rem' },
  { titleWidth: '7rem', descriptionWidth: '25rem' },
  { titleWidth: '10.25rem', descriptionWidth: '29rem' },
  { titleWidth: '8.5rem', descriptionWidth: '27rem' },
  { titleWidth: '8rem', descriptionWidth: '24rem' },
] as const;

const compactRows = [
  { titleWidth: '14rem', descriptionWidth: '23rem' },
  { titleWidth: '18rem', descriptionWidth: '26rem' },
  { titleWidth: '12rem', descriptionWidth: '20rem' },
] as const;

interface SectionHeaderSkeletonProps {
  titleWidth: string;
  labelWidth?: string;
  asideWidth?: string;
}

const SectionHeaderSkeleton = ({
  asideWidth = '2rem',
  labelWidth = '8rem',
  titleWidth,
}: SectionHeaderSkeletonProps) => {
  return (
    <div className={s.sectionHeader}>
      <div className={s.sectionHeaderMain}>
        <div className={s.sectionLabelRow}>
          <Skeleton borderRadius="999px" height="0.75rem" width={labelWidth} />
          <Skeleton className={s.copyActionLine} borderRadius="0.25rem" />
        </div>

        <Skeleton className={s.sectionTitleLine} borderRadius="999px" width={titleWidth} />
      </div>

      <Skeleton className={s.sectionAsideLine} borderRadius="0.5rem" width={asideWidth} />
    </div>
  );
};

export const ReportPageSkeleton = () => {
  return (
    <>
      <span className={s.status} role="status">
        Loading report page
      </span>

      <div aria-hidden="true" className={`${pageStyles.reportPage} ${s.visualRoot}`}>
        <Card className={s.repositoryAnalysisPanel}>
          <section className={s.repositoryAnalysisHeader}>
            <Skeleton borderRadius="999px" height="0.75rem" width="8.5rem" />
            <Skeleton className={s.repositoryAnalysisTitleLine} borderRadius="999px" />

            <div className={s.repositoryAnalysisDescriptionLines}>
              <Skeleton className={s.repositoryAnalysisDescriptionLine} borderRadius="999px" />
              <Skeleton borderRadius="999px" height="1rem" width="12rem" />
            </div>
          </section>

          <div className={s.repositoryAnalysisForm}>
            <div className={s.repositoryFields}>
              <div className={s.inputPreview}>
                <Skeleton className={s.inputLabelLine} borderRadius="999px" />

                <div className={s.inputControlLine}>
                  <Skeleton className={s.inputIconLine} borderRadius="0.25rem" />
                  <Skeleton borderRadius="999px" height="1rem" width="14.5rem" />
                </div>

                <Skeleton className={s.inputHintLine} borderRadius="999px" />
              </div>

              <div className={s.checkboxPreview}>
                <Skeleton className={s.checkboxLine} borderRadius="0.375rem" />

                <div className={s.checkboxText}>
                  <Skeleton borderRadius="999px" height="0.875rem" width="10rem" />
                  <Skeleton borderRadius="999px" height="0.875rem" width="21rem" />
                </div>
              </div>
            </div>

            <Skeleton className={s.submitButtonLine} borderRadius="0.5rem" />
          </div>
        </Card>

        <section className={`${pageStyles.content} ${s.reportContent}`}>
          <section className={pageStyles.section} data-testid="report-page-skeleton-section">
            <Card className={s.repositorySummaryCard}>
              <SectionHeaderSkeleton asideWidth="12rem" labelWidth="7rem" titleWidth="22rem" />

              <Skeleton className={s.repositoryDescriptionLine} borderRadius="999px" />

              <div className={s.repositoryMetaList}>
                {['stars', 'forks', 'branch', 'projectPath', 'license'].map((item) => (
                  <div className={s.repositoryMetaItem} key={item}>
                    <Skeleton className={s.metaIconLine} borderRadius="0.25rem" />
                    <Skeleton borderRadius="999px" height="0.875rem" width="4rem" />
                    <Skeleton borderRadius="999px" height="0.875rem" width="5rem" />
                  </div>
                ))}
              </div>

              <div className={s.disclosureSummaryLine}>
                <Skeleton className={s.disclosureIconLine} borderRadius="0.25rem" />
                <Skeleton borderRadius="999px" height="0.875rem" width="12rem" />
                <Skeleton borderRadius="999px" height="0.75rem" width="7rem" />
              </div>
            </Card>
          </section>

          <section className={pageStyles.section} data-testid="report-page-skeleton-section">
            <Card className={s.analysisDetailsCard}>
              <SectionHeaderSkeleton labelWidth="8.5rem" titleWidth="15rem" />

              <div className={s.toolingSection}>
                <div className={s.subHeaderLine}>
                  <Skeleton className={s.subHeaderIconLine} borderRadius="0.25rem" />
                  <Skeleton borderRadius="999px" height="1rem" width="9rem" />
                </div>

                <div className={s.toolingGrid}>
                  {toolingRows.map((row) => (
                    <div className={s.toolingItem} key={row.id}>
                      <Skeleton borderRadius="999px" height="0.75rem" width="6rem" />

                      <div className={s.toolingItemBody}>
                        <div className={s.toolingTitleRow}>
                          <Skeleton borderRadius="999px" height="0.875rem" width={row.titleWidth} />
                          <Skeleton className={s.badgeLine} borderRadius="999px" />
                        </div>

                        <Skeleton borderRadius="999px" height="0.75rem" width={row.sourceWidth} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={s.sourcesSummaryLine}>
                <Skeleton className={s.disclosureIconLine} borderRadius="0.25rem" />
                <Skeleton className={s.subHeaderIconLine} borderRadius="0.25rem" />
                <Skeleton borderRadius="999px" height="0.875rem" width="10rem" />
                <Skeleton borderRadius="999px" height="0.75rem" width="5rem" />
              </div>
            </Card>
          </section>

          <section className={pageStyles.section} data-testid="report-page-skeleton-section">
            <Card className={s.healthScoreCard}>
              <SectionHeaderSkeleton asideWidth="7rem" labelWidth="7rem" titleWidth="13rem" />

              <div className={s.scoreBlock}>
                <div className={s.scoreLine}>
                  <Skeleton borderRadius="999px" height="3.5rem" width="5.75rem" />
                  <Skeleton borderRadius="999px" height="1.125rem" width="3rem" />
                </div>

                <Skeleton className={s.scoreDescriptionLine} borderRadius="999px" />
              </div>

              <Skeleton className={s.progressLine} borderRadius="999px" />
            </Card>
          </section>

          <section className={pageStyles.section} data-testid="report-page-skeleton-section">
            <Card className={s.metricsCard}>
              <SectionHeaderSkeleton asideWidth="5.5rem" labelWidth="5rem" titleWidth="12rem" />

              <ul className={s.metricsList}>
                {reportScoreCategoryOptions.map((category, index) => {
                  const row = metricRows[index % metricRows.length];

                  return (
                    <li
                      className={s.metricRow}
                      data-testid="report-page-skeleton-metric"
                      key={category}
                    >
                      <div className={s.metricMain}>
                        <Skeleton borderRadius="999px" height="0.875rem" width={row.titleWidth} />
                        <Skeleton
                          borderRadius="999px"
                          height="0.875rem"
                          width={row.descriptionWidth}
                        />
                      </div>

                      <div className={s.metricMeta}>
                        <Skeleton borderRadius="999px" height="1rem" width="7rem" />
                        <Skeleton borderRadius="999px" height="1rem" width="4rem" />
                      </div>

                      <Skeleton className={s.metricProgressLine} borderRadius="999px" />
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>

          <div className={pageStyles.detailsGrid}>
            <section
              className={`${pageStyles.section} ${pageStyles.detailsSection}`}
              data-testid="report-page-skeleton-section"
            >
              <Card className={`${pageStyles.detailsCard} ${s.compactDetailsCard}`}>
                <SectionHeaderSkeleton asideWidth="4.5rem" labelWidth="5rem" titleWidth="9rem" />

                <ul className={s.compactList}>
                  {compactRows.map((row) => (
                    <li className={s.checkRow} key={`${row.titleWidth}-${row.descriptionWidth}`}>
                      <Skeleton className={s.statusBadgeLine} borderRadius="999px" />

                      <div className={s.compactRowText}>
                        <Skeleton borderRadius="999px" height="0.875rem" width={row.titleWidth} />
                        <Skeleton
                          borderRadius="999px"
                          height="0.875rem"
                          width={row.descriptionWidth}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>

            <section
              className={`${pageStyles.section} ${pageStyles.detailsSection}`}
              data-testid="report-page-skeleton-section"
            >
              <Card className={`${pageStyles.detailsCard} ${s.compactDetailsCard}`}>
                <SectionHeaderSkeleton asideWidth="4.5rem" labelWidth="8rem" titleWidth="14rem" />

                <div className={s.recommendationGroups}>
                  <Skeleton borderRadius="999px" height="0.75rem" width="6rem" />

                  <ul className={s.compactList}>
                    {compactRows.map((row) => (
                      <li
                        className={s.recommendationRow}
                        key={`${row.descriptionWidth}-${row.titleWidth}`}
                      >
                        <div className={s.badgeGroup}>
                          <Skeleton className={s.smallBadgeLine} borderRadius="999px" />
                          <Skeleton className={s.smallBadgeLine} borderRadius="999px" />
                        </div>

                        <div className={s.compactRowText}>
                          <Skeleton borderRadius="999px" height="0.875rem" width={row.titleWidth} />
                          <Skeleton
                            borderRadius="999px"
                            height="0.875rem"
                            width={row.descriptionWidth}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </section>
          </div>
        </section>
      </div>
    </>
  );
};
