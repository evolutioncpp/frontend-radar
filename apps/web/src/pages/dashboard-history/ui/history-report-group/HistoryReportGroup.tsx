import clsx from 'clsx';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getReportPath } from '@/shared/config/routes/appRoutes';
import { normalizeScore } from '@/shared/lib/format-score';
import { Button } from '@/shared/ui/Button';

import s from '../DashboardHistoryPage.module.scss';
import { HistoryReportCard } from '../history-report-card/HistoryReportCard';
import { ReportRunMetadataList } from '../report-run-metadata-list/ReportRunMetadataList';

import type { ReportHistoryGroupViewModel, ReportHistoryItemViewModel } from '@/entities/report';

interface HistoryReportGroupProps {
  group: ReportHistoryGroupViewModel;
}

const HistoryPreviousRunItem = ({
  latestRun,
  run,
}: {
  latestRun: ReportHistoryItemViewModel;
  run: ReportHistoryItemViewModel;
}) => {
  const { t } = useTranslation('dashboard-history');
  const normalizedScore = typeof run.score === 'number' ? normalizeScore(run.score) : null;
  const canCompare = latestRun.status === 'completed' && run.status === 'completed';

  return (
    <li className={s.previousRunItem}>
      <div className={s.previousRunRow}>
        <Link
          aria-label={t('group.openPreviousRunAria', {
            date: run.activityLabel,
            repository: run.repositoryName,
          })}
          className={s.previousRunLink}
          to={getReportPath(run.id)}
        >
          <ReportRunMetadataList
            activityAt={run.activityAt}
            activityLabel={run.activityLabel}
            branch={run.branch}
            commitTitle={run.commitTitle}
            status={run.status}
            variant="previous"
          />

          <span className={s.previousRunScore}>
            {normalizedScore === null ? t(`card.statuses.${run.status}`) : `${normalizedScore}/100`}
          </span>
        </Link>

        {canCompare ? (
          <Link
            aria-label={t('group.compareWithLatestAria', {
              date: run.activityLabel,
              repository: run.repositoryName,
            })}
            className={s.previousRunCompareLink}
            to={getReportPath(latestRun.id, { compareWith: run.id })}
          >
            <ArrowLeftRight
              aria-hidden="true"
              className={s.previousRunCompareIcon}
              strokeWidth={2}
            />
            <span>{t('group.compareWithLatest')}</span>
          </Link>
        ) : null}
      </div>
    </li>
  );
};

export const HistoryReportGroup = ({ group }: HistoryReportGroupProps) => {
  const { t } = useTranslation('dashboard-history');
  const [isOpen, setIsOpen] = useState(false);
  const previousRunsId = useId();
  const previousRunsLabelId = `${previousRunsId}-label`;
  const hasPreviousRuns = group.previousRuns.length > 0;

  return (
    <section className={s.historyGroup} aria-label={group.repositoryName}>
      <HistoryReportCard
        activityAt={group.latestRun.activityAt}
        activityLabel={group.latestRun.activityLabel}
        branch={group.branch}
        checksCount={group.latestRun.checksCount}
        commitTitle={group.latestRun.commitTitle}
        metricsCount={group.latestRun.metricsCount}
        projectPath={group.projectPath}
        recommendationsCount={group.latestRun.recommendationsCount}
        repositoryName={group.repositoryName}
        score={group.latestRun.score}
        status={group.latestRun.status}
        to={getReportPath(group.latestRun.id)}
      >
        {hasPreviousRuns ? (
          <div className={s.previousRunsPanel}>
            <Button
              aria-controls={previousRunsId}
              aria-expanded={isOpen}
              className={s.disclosureButton}
              onClick={() => setIsOpen((currentValue) => !currentValue)}
              variant="ghost"
            >
              <ChevronDown
                aria-hidden="true"
                className={clsx(s.disclosureIcon, isOpen && s.disclosureIconOpen)}
                strokeWidth={2}
              />
              <span>
                {isOpen
                  ? t('group.hidePreviousRuns')
                  : t('group.showPreviousRuns', {
                      count: group.previousRuns.length,
                    })}
              </span>
            </Button>

            <span className={s.groupRunCount}>
              {t('group.runCount', { count: group.runCount })}
            </span>

            {isOpen ? (
              <div className={s.previousRuns} id={previousRunsId}>
                <p className={s.previousRunsLabel} id={previousRunsLabelId}>
                  {t('group.previousRunsLabel')}
                </p>
                <ul aria-labelledby={previousRunsLabelId} className={s.previousRunsList}>
                  {group.previousRuns.map((run) => (
                    <HistoryPreviousRunItem key={run.id} latestRun={group.latestRun} run={run} />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </HistoryReportCard>
    </section>
  );
};
