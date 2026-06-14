import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDateTime } from '@/shared/lib/format-date';
import { Card } from '@/shared/ui/Card';
import { Spinner } from '@/shared/ui/Spinner';

import s from './ReportProcessingPanel.module.scss';

import type { ProjectReportState } from '@/entities/report';

type ProcessingAnalysis = Extract<ProjectReportState, { status: 'processing' }>['analysis'];
type ProcessingStatus = Extract<ProjectReportState, { status: 'processing' }>['analysisStatus'];

interface ReportProcessingPanelProps {
  analysis: ProcessingAnalysis;
  status: ProcessingStatus;
}

const processingStageIds = [
  'queued',
  'starting',
  'repository_metadata',
  'project_detection',
  'repository_signals',
  'source_scan',
  'workflow_analysis',
  'scoring',
  'report_building',
] as const;

type ProcessingStageId = ProcessingAnalysis['progress']['stage'];
type ProcessingStepState = 'complete' | 'active' | 'pending';

const staleProgressThresholdMs = 60_000;

const getShortCommitSha = (sha: string | null) => {
  return sha ? sha.slice(0, 7) : null;
};

const getStepState = (
  activeStage: ProcessingStageId,
  stepId: ProcessingStageId,
): ProcessingStepState => {
  const activeIndex = processingStageIds.indexOf(activeStage);
  const stepIndex = processingStageIds.indexOf(stepId);

  if (stepIndex < activeIndex) {
    return 'complete';
  }

  if (stepIndex === activeIndex) {
    return 'active';
  }

  return 'pending';
};

export const ReportProcessingPanel = ({ analysis, status }: ReportProcessingPanelProps) => {
  const { i18n, t } = useTranslation('dashboard');
  const [now, setNow] = useState<number | null>(null);
  const repositoryName = `${analysis.owner}/${analysis.repository}`;
  const commitLabel = analysis.latestCommitTitle ?? getShortCommitSha(analysis.latestCommitSha);
  const progress = analysis.progress;
  const startedAt = analysis.startedAt ?? analysis.createdAt;
  const startedAtLabel = formatDateTime(startedAt, i18n.language);
  const progressUpdatedAtLabel = formatDateTime(progress.updatedAt, i18n.language);
  const progressUpdatedAtTime = Date.parse(progress.updatedAt);
  const isProgressStale =
    now !== null &&
    Number.isFinite(progressUpdatedAtTime) &&
    now - progressUpdatedAtTime > staleProgressThresholdMs;

  useEffect(() => {
    const updateNow = () => {
      setNow(Date.now());
    };
    const intervalId = window.setInterval(updateNow, 10_000);

    updateNow();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [progress.updatedAt]);

  const metadata = [
    {
      id: 'branch',
      label: t('page.reportProcessing.metadata.branch'),
      value: analysis.branch,
    },
    analysis.projectPath
      ? {
          id: 'projectPath',
          label: t('page.reportProcessing.metadata.projectPath'),
          value: analysis.projectPath,
        }
      : null,
    commitLabel
      ? {
          id: 'commit',
          label: t('page.reportProcessing.metadata.commit'),
          value: commitLabel,
        }
      : null,
    {
      id: 'startedAt',
      label: t('page.reportProcessing.metadata.startedAt'),
      value: startedAtLabel,
    },
    {
      id: 'progressUpdatedAt',
      label: t('page.reportProcessing.metadata.progressUpdatedAt'),
      value: progressUpdatedAtLabel,
    },
  ].filter((item): item is { id: string; label: string; value: string } => Boolean(item));

  return (
    <Card className={s.panel}>
      <div className={s.header}>
        <div className={s.headingGroup}>
          <span className={s.eyebrow}>{t('page.reportProcessing.label')}</span>
          <h1 className={s.title}>{t(`page.reportProcessing.statuses.${status}`)}</h1>
          <p className={s.description}>{t('page.reportProcessing.description')}</p>
        </div>
        <div className={s.status}>
          <Spinner label={t('page.reportProcessing.spinnerLabel')} size="md" />
          <span>{t('page.reportProcessing.polling')}</span>
        </div>
      </div>

      <div className={s.summary}>
        <div className={s.repository}>
          <span className={s.summaryLabel}>{t('page.reportProcessing.repository')}</span>
          <strong className={s.repositoryName}>{repositoryName}</strong>
        </div>
        <dl className={s.metadata}>
          {metadata.map((item) => (
            <div className={s.metadataItem} key={item.id}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={s.currentStage}>
        <span className={s.summaryLabel}>{t('page.reportProcessing.currentStage')}</span>
        <strong>{t(`page.reportProcessing.steps.${progress.stage}`)}</strong>
        <p>{t(`page.reportProcessing.stepDescriptions.${progress.stage}`)}</p>
        {isProgressStale ? (
          <p className={s.staleHint}>{t('page.reportProcessing.staleHint')}</p>
        ) : null}
      </div>

      <ol className={s.steps} aria-label={t('page.reportProcessing.stepsLabel')}>
        {processingStageIds.map((stepId) => {
          const stepState = getStepState(progress.stage, stepId);

          return (
            <li
              aria-current={stepState === 'active' ? 'step' : undefined}
              className={clsx(s.step, s[`step_${stepState}`])}
              key={stepId}
            >
              <span className={s.stepMarker} aria-hidden="true" />
              <span className={s.stepText}>{t(`page.reportProcessing.steps.${stepId}`)}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
};
