import clsx from 'clsx';
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

const processingStepIds = ['created', 'queued', 'reading', 'building'] as const;

type ProcessingStepId = (typeof processingStepIds)[number];
type ProcessingStepState = 'complete' | 'active' | 'pending';

const getShortCommitSha = (sha: string | null) => {
  return sha ? sha.slice(0, 7) : null;
};

const getStepState = (status: ProcessingStatus, stepId: ProcessingStepId): ProcessingStepState => {
  if (stepId === 'created') {
    return 'complete';
  }

  if (status === 'queued') {
    return stepId === 'queued' ? 'active' : 'pending';
  }

  if (stepId === 'queued') {
    return 'complete';
  }

  return stepId === 'reading' ? 'active' : 'pending';
};

export const ReportProcessingPanel = ({ analysis, status }: ReportProcessingPanelProps) => {
  const { i18n, t } = useTranslation('dashboard');
  const repositoryName = `${analysis.owner}/${analysis.repository}`;
  const commitLabel = analysis.latestCommitTitle ?? getShortCommitSha(analysis.latestCommitSha);
  const updatedAtLabel = formatDateTime(analysis.updatedAt, i18n.language);

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
      id: 'updatedAt',
      label: t('page.reportProcessing.metadata.updatedAt'),
      value: updatedAtLabel,
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

      <ol className={s.steps} aria-label={t('page.reportProcessing.stepsLabel')}>
        {processingStepIds.map((stepId) => {
          const stepState = getStepState(status, stepId);

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
