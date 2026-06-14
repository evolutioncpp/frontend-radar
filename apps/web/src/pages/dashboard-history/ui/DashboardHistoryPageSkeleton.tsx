import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';

import pageStyles from './DashboardHistoryPage.module.scss';
import s from './DashboardHistoryPageSkeleton.module.scss';

const historyCards = [
  {
    id: 'latest',
    commitWidth: 'min(100%, 19rem)',
    hasPreviousRunsPanel: true,
    metadataWidths: ['8.25rem', '6rem', '4rem', '6.5rem'],
    repositoryWidth: 'min(100%, 18rem)',
    scoreWidth: '3.25rem',
  },
  {
    id: 'secondary',
    commitWidth: 'min(100%, 15rem)',
    hasPreviousRunsPanel: false,
    metadataWidths: ['7.75rem', '5.5rem', '4.5rem'],
    repositoryWidth: 'min(100%, 15.5rem)',
    scoreWidth: '3rem',
  },
] as const;

const summaryRows = [
  { id: 'metrics', valueWidth: '0.75rem', labelWidth: '4rem' },
  { id: 'checks', valueWidth: '0.75rem', labelWidth: '3.5rem' },
  { id: 'recommendations', valueWidth: '0.75rem', labelWidth: '6.75rem' },
] as const;

export const DashboardHistoryPageSkeleton = () => {
  return (
    <>
      <span className={s.status} role="status">
        Loading dashboard history
      </span>

      <div aria-hidden="true" className={`${pageStyles.dashboardHistoryPage} ${s.visualRoot}`}>
        <section className={pageStyles.header}>
          <Skeleton className={s.titleLine} borderRadius="999px" />

          <div className={s.descriptionLines}>
            <Skeleton className={s.descriptionLine} borderRadius="999px" />
            <Skeleton borderRadius="999px" height="1rem" width="min(100%, 32rem)" />
          </div>
        </section>

        {historyCards.map((card) => (
          <section
            className={pageStyles.historyGroup}
            data-testid="dashboard-history-skeleton-card"
            key={card.id}
          >
            <Card className={pageStyles.historyCard}>
              <div className={pageStyles.cardLink}>
                <div className={pageStyles.cardMain}>
                  <div className={pageStyles.cardTop}>
                    <Skeleton borderRadius="999px" height="0.75rem" width="8.5rem" />
                    <Skeleton className={s.compactDateLine} borderRadius="999px" />
                  </div>

                  <div className={pageStyles.repository}>
                    <div className={pageStyles.repositoryHeader}>
                      <Skeleton
                        className={s.repositoryNameLine}
                        borderRadius="999px"
                        width={card.repositoryWidth}
                      />

                      <div className={pageStyles.commitTitle}>
                        <Skeleton className={s.commitIconLine} borderRadius="0.25rem" />
                        <Skeleton borderRadius="999px" height="0.875rem" width={card.commitWidth} />
                      </div>
                    </div>

                    <div className={pageStyles.metaList}>
                      {card.metadataWidths.map((width) => (
                        <span className={pageStyles.metaItem} key={width}>
                          <Skeleton className={s.metaIconLine} borderRadius="0.25rem" />
                          <Skeleton borderRadius="999px" height="0.875rem" width={width} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={pageStyles.cardAside}>
                  <div className={pageStyles.score}>
                    <Skeleton borderRadius="999px" height="0.75rem" width="5.75rem" />

                    <div className={pageStyles.scoreValueWrapper}>
                      <Skeleton
                        className={s.scoreValueLine}
                        borderRadius="999px"
                        width={card.scoreWidth}
                      />
                      <Skeleton borderRadius="999px" height="1rem" width="2.5rem" />
                    </div>
                  </div>

                  <dl className={pageStyles.summaryList}>
                    {summaryRows.map((row) => (
                      <div className={pageStyles.summaryItem} key={row.id}>
                        <dt className={pageStyles.summaryLabel}>
                          <Skeleton borderRadius="999px" height="0.75rem" width={row.labelWidth} />
                        </dt>
                        <dd className={pageStyles.summaryValue}>
                          <Skeleton borderRadius="999px" height="0.875rem" width={row.valueWidth} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {card.hasPreviousRunsPanel ? (
                <div
                  className={pageStyles.previousRunsPanel}
                  data-testid="dashboard-history-skeleton-previous-runs-panel"
                >
                  <div className={s.disclosurePreview}>
                    <Skeleton className={s.disclosureIconLine} borderRadius="0.25rem" />
                    <Skeleton borderRadius="999px" height="0.875rem" width="9.5rem" />
                  </div>

                  <Skeleton borderRadius="999px" height="0.75rem" width="3.75rem" />
                </div>
              ) : null}
            </Card>
          </section>
        ))}
      </div>
    </>
  );
};
