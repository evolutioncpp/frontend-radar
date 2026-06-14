import clsx from 'clsx';

import { selectIsDashboardSidebarCollapsed } from '@/features/app-settings';
import { useAppSelector } from '@/shared/lib/redux/hooks';
import { Skeleton } from '@/shared/ui/Skeleton';

import layoutStyles from './DashboardLayout.module.scss';
import s from './DashboardLayoutSkeleton.module.scss';

const navigationRows = [
  { id: 'overview', width: '4.5rem' },
  { id: 'history', width: '3.75rem' },
  { id: 'settings', width: '4.25rem' },
] as const;

export const DashboardLayoutSkeleton = () => {
  const isSidebarCollapsed = useAppSelector(selectIsDashboardSidebarCollapsed);

  return (
    <>
      <span className={s.status} role="status">
        Loading dashboard
      </span>

      <div
        aria-hidden="true"
        className={clsx(
          layoutStyles.dashboardLayout,
          isSidebarCollapsed && layoutStyles.dashboardLayoutCollapsed,
          s.layout,
          isSidebarCollapsed && s.layoutCollapsed,
        )}
      >
        <aside className={s.sidebar}>
          <div className={s.sidebarBody}>
            <div className={s.navigation}>
              {navigationRows.map((row) => (
                <div className={s.navigationRow} key={row.id}>
                  <Skeleton className={s.navigationIcon} borderRadius="0.25rem" />
                  <Skeleton
                    className={s.navigationText}
                    borderRadius="999px"
                    height="0.875rem"
                    width={row.width}
                  />
                </div>
              ))}
            </div>

            <div className={s.sidebarFooter}>
              <div className={s.navigationRow}>
                <Skeleton className={s.navigationIcon} borderRadius="0.25rem" />
                <Skeleton
                  className={s.navigationText}
                  borderRadius="999px"
                  height="0.875rem"
                  width="5rem"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className={layoutStyles.mobileSidebarOverlay} />

        <div className={layoutStyles.workspace}>
          <header className={s.header}>
            <Skeleton className={s.sidebarToggle} borderRadius="0.375rem" />

            <div className={s.headerStart}>
              <Skeleton className={s.mobileSidebarToggle} borderRadius="0.375rem" />
              <Skeleton borderRadius="999px" height="1rem" width="7.5rem" />
            </div>

            <div className={s.headerActions}>
              <Skeleton className={s.headerIconButton} borderRadius="0.375rem" />

              <div className={s.headerLink}>
                <Skeleton borderRadius="0.25rem" height="1rem" width="1rem" />
                <Skeleton borderRadius="999px" height="0.875rem" width="3.25rem" />
              </div>
            </div>
          </header>

          <main className={layoutStyles.content}>
            <div className={s.contentShell}>
              <section className={s.heroPanel}>
                <div className={s.panelHeader}>
                  <Skeleton borderRadius="999px" height="0.75rem" width="8.5rem" />
                  <Skeleton className={s.titleLine} borderRadius="999px" height="3.375rem" />
                  <div className={s.descriptionLines}>
                    <Skeleton className={s.descriptionLine} borderRadius="999px" height="1rem" />
                    <Skeleton borderRadius="999px" height="1rem" width="12rem" />
                  </div>
                </div>

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
                          <Skeleton
                            borderRadius="999px"
                            height="0.875rem"
                            width="min(100%, 21rem)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Skeleton className={s.submitPreview} borderRadius="0.5rem" height="3.125rem" />
                </div>
              </section>

              <div className={s.secondaryGrid}>
                <section className={s.secondaryPanel}>
                  <Skeleton borderRadius="999px" height="0.75rem" width="7rem" />
                  <Skeleton borderRadius="999px" height="1.5rem" width="52%" />
                  <div className={s.listPreview}>
                    <Skeleton borderRadius="999px" height="0.875rem" width="100%" />
                    <Skeleton borderRadius="999px" height="0.875rem" width="82%" />
                    <Skeleton borderRadius="999px" height="0.875rem" width="68%" />
                  </div>
                </section>

                <section className={s.secondaryPanel}>
                  <Skeleton borderRadius="999px" height="0.75rem" width="6.5rem" />
                  <Skeleton borderRadius="999px" height="1.5rem" width="46%" />
                  <div className={s.metricPreview}>
                    <Skeleton borderRadius="999px" height="0.875rem" width="72%" />
                    <Skeleton borderRadius="999px" height="0.875rem" width="88%" />
                    <Skeleton borderRadius="999px" height="0.875rem" width="58%" />
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
