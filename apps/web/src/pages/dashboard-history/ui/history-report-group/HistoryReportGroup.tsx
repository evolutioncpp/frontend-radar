import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getReportPath } from '@/shared/config/routes/appRoutes';
import { normalizeScore } from '@/shared/lib/format-score';

import s from '../DashboardHistoryPage.module.scss';
import { HistoryReportCard } from '../history-report-card/HistoryReportCard';

import type { ReportHistoryGroupViewModel, ReportHistoryItemViewModel } from '@/entities/report';

interface HistoryReportGroupProps {
  group: ReportHistoryGroupViewModel;
}

const HistoryPreviousRunItem = ({ run }: { run: ReportHistoryItemViewModel }) => {
  const { t } = useTranslation('dashboard-history');
  const normalizedScore = typeof run.score === 'number' ? normalizeScore(run.score) : null;

  return (
    <li className={s.previousRunItem}>
      <Link
        aria-label={t('group.openPreviousRunAria', {
          date: run.activityLabel,
          repository: run.repositoryName,
        })}
        className={s.previousRunLink}
        to={getReportPath(run.id)}
      >
        <span className={s.previousRunMain}>
          <time className={s.previousRunDate} dateTime={run.activityAt}>
            {run.activityLabel}
          </time>
          <span className={s.previousRunStatus}>{t(`card.statuses.${run.status}`)}</span>
        </span>

        <span className={s.previousRunScore}>
          {normalizedScore === null ? t(`card.statuses.${run.status}`) : `${normalizedScore}/100`}
        </span>
      </Link>
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
        checksCount={group.latestRun.checksCount}
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
            <button
              aria-controls={previousRunsId}
              aria-expanded={isOpen}
              className={s.disclosureButton}
              onClick={() => setIsOpen((currentValue) => !currentValue)}
              type="button"
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
            </button>

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
                    <HistoryPreviousRunItem key={run.id} run={run} />
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
