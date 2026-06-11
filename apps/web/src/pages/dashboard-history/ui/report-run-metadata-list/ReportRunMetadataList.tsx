import { CalendarClock, Folder, GitBranch, GitCommit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import s from '../DashboardHistoryPage.module.scss';
import { historyStatusIconMap } from '../historyStatusIcons';

import type { ReportAnalysisStatus } from '@/entities/report';

interface ReportRunMetadataListProps {
  activityAt: string;
  activityLabel: string;
  branch: string;
  commitTitle?: string | null;
  projectPath?: string | null;
  status: ReportAnalysisStatus;
  variant?: 'card' | 'previous';
}

export const ReportRunMetadataList = ({
  activityAt,
  activityLabel,
  branch,
  commitTitle,
  projectPath,
  status,
  variant = 'card',
}: ReportRunMetadataListProps) => {
  const { t } = useTranslation('dashboard-history');
  const StatusIcon = historyStatusIconMap[status];
  const isPrevious = variant === 'previous';
  const metadataItems = [
    {
      id: 'activityAt',
      icon: CalendarClock,
      isCode: false,
      label: t('card.metadata.activityAt'),
      value: activityLabel,
    },
    {
      id: 'status',
      icon: StatusIcon,
      isCode: false,
      label: t('card.metadata.status'),
      value: t(`card.statuses.${status}`),
    },
    {
      id: 'branch',
      icon: GitBranch,
      isCode: true,
      label: t('card.metadata.branch'),
      value: branch,
    },
    ...(projectPath
      ? [
          {
            id: 'projectPath',
            icon: Folder,
            isCode: true,
            label: t('card.metadata.projectPath'),
            value: projectPath,
          },
        ]
      : []),
  ];

  return (
    <div
      aria-label={isPrevious ? undefined : t('card.metadataAria')}
      className={isPrevious ? s.previousRunMain : s.metaList}
    >
      {metadataItems.map((item) => {
        const Icon = item.icon;
        const itemLabel = `${item.label}: ${item.value}`;
        const content =
          item.id === 'activityAt' ? (
            <time dateTime={activityAt}>{item.value}</time>
          ) : (
            <span
              className={
                item.isCode ? (isPrevious ? s.previousRunMetaCode : s.metaCode) : s.metaValue
              }
            >
              {item.value}
            </span>
          );

        return (
          <span
            aria-label={itemLabel}
            className={isPrevious ? s.previousRunMetaItem : s.metaItem}
            key={item.id}
            title={itemLabel}
          >
            <Icon
              aria-hidden="true"
              className={isPrevious ? s.previousRunMetaIcon : s.metaIcon}
              strokeWidth={2}
            />
            {content}
          </span>
        );
      })}

      {isPrevious && commitTitle ? (
        <span className={s.previousRunCommitTitle} title={commitTitle}>
          <GitCommit aria-hidden="true" className={s.previousRunCommitTitleIcon} strokeWidth={2} />
          <span className={s.previousRunCommitTitleText}>{commitTitle}</span>
        </span>
      ) : null}
    </div>
  );
};
