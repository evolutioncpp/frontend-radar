import {
  ChevronDown,
  Folder,
  GitBranch,
  GitCommit,
  GitFork,
  Package,
  Scale,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatNumber } from '@/shared/lib/format-number';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './RepositorySummary.module.scss';

import type { ReportRepository } from '@/entities/report';
import type { ReactNode } from 'react';

interface RepositorySummaryProps {
  repository: ReportRepository;
  headerAction?: ReactNode;
  asideAction?: ReactNode;
}

interface MetaItem {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  isCode?: boolean;
}

const detectionStatusOrder = {
  missing: 0,
  warning: 1,
  found: 2,
} as const satisfies Record<
  ReportRepository['projectDetection']['signals'][number]['status'],
  number
>;

const confidenceBadgeVariants = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
} as const satisfies Record<
  ReportRepository['projectDetection']['confidence'],
  'success' | 'warning' | 'danger'
>;

export const RepositorySummary = ({
  asideAction,
  headerAction,
  repository,
}: RepositorySummaryProps) => {
  const { t } = useTranslation('dashboard');

  const repositoryFullName = `${repository.owner}/${repository.name}`;
  const detectionMarkerClasses = {
    found: s.projectDetectionSignalMarker_found,
    missing: s.projectDetectionSignalMarker_missing,
    warning: s.projectDetectionSignalMarker_warning,
  } as const satisfies Record<
    ReportRepository['projectDetection']['signals'][number]['status'],
    string
  >;
  const sortedProjectDetectionSignals = [...repository.projectDetection.signals].sort(
    (left, right) => detectionStatusOrder[left.status] - detectionStatusOrder[right.status],
  );

  const metaItems: MetaItem[] = [
    {
      id: 'stars',
      icon: Star,
      label: t('repository.metadata.stars'),
      value: formatNumber(repository.stars),
    },
    {
      id: 'forks',
      icon: GitFork,
      label: t('repository.metadata.forks'),
      value: formatNumber(repository.forks),
    },
    {
      id: 'branch',
      icon: GitBranch,
      label: t('repository.metadata.branch'),
      value: repository.defaultBranch,
      isCode: true,
    },
    ...(repository.projectPath
      ? [
          {
            id: 'projectPath',
            icon: Folder,
            label: t('repository.metadata.projectPath'),
            value: repository.projectPath,
            isCode: true,
          },
        ]
      : []),
    {
      id: 'license',
      icon: Scale,
      label: t('repository.metadata.license'),
      value: repository.license ?? t('repository.metadata.unknown'),
    },
  ];

  return (
    <Card className={s.repositorySummary}>
      <SectionHeader
        action={headerAction}
        aside={
          <div className={s.headerAside}>
            {asideAction}
            <a className={s.repositoryLink} href={repository.url} rel="noreferrer" target="_blank">
              {t('repository.openRepository')}
            </a>
          </div>
        }
        className={s.header}
        label={t('repository.label')}
        title={repositoryFullName}
        titleAfter={
          repository.latestCommitTitle ? (
            <p className={s.commitTitle} title={repository.latestCommitTitle}>
              <GitCommit aria-hidden="true" className={s.commitTitleIcon} strokeWidth={2} />
              <span className={s.commitTitleText}>{repository.latestCommitTitle}</span>
            </p>
          ) : null
        }
      />

      {repository.description ? <p className={s.description}>{repository.description}</p> : null}

      <dl aria-label={t('repository.metadataAria')} className={s.metaList}>
        {metaItems.map((item) => {
          const Icon = item.icon;

          return (
            <div className={s.metaItem} key={item.id}>
              <dt className={s.metaLabel}>
                <Icon aria-hidden="true" className={s.metaIcon} strokeWidth={2} />
                <span>{item.label}</span>
              </dt>

              <dd className={item.isCode ? s.metaValueCode : s.metaValue}>{item.value}</dd>
            </div>
          );
        })}
      </dl>

      <details className={s.projectDetection}>
        <summary className={s.projectDetectionSummary}>
          <ChevronDown
            aria-hidden="true"
            className={s.projectDetectionSummaryIcon}
            strokeWidth={2}
          />
          <span>{t('repository.projectDetection.title')}</span>
          <span className={s.projectDetectionSummaryMeta}>
            {t(`repository.projectDetection.sources.${repository.projectDetection.source}`)}
          </span>
        </summary>

        <div className={s.projectDetectionContent}>
          <dl className={s.projectDetectionMetaList}>
            <div className={s.projectDetectionMetaItem}>
              <dt>{t('repository.projectDetection.source')}</dt>
              <dd>
                {t(`repository.projectDetection.sources.${repository.projectDetection.source}`)}
              </dd>
            </div>

            <div className={s.projectDetectionMetaItem}>
              <dt>{t('repository.projectDetection.packageJsonPath')}</dt>
              <dd>
                <Package
                  aria-hidden="true"
                  className={s.projectDetectionMetaIcon}
                  strokeWidth={2}
                />
                <span>{repository.projectDetection.packageJsonPath ?? 'package.json'}</span>
              </dd>
            </div>

            <div className={s.projectDetectionMetaItem}>
              <dt>{t('repository.projectDetection.confidence')}</dt>
              <dd>
                <Badge variant={confidenceBadgeVariants[repository.projectDetection.confidence]}>
                  {t(
                    `repository.projectDetection.confidenceLevels.${repository.projectDetection.confidence}`,
                  )}
                </Badge>
              </dd>
            </div>
          </dl>

          <ul className={s.projectDetectionSignalList}>
            {sortedProjectDetectionSignals.map((signal) => (
              <li className={s.projectDetectionSignal} key={signal.id}>
                <span className={detectionMarkerClasses[signal.status]} aria-hidden="true" />
                <div className={s.projectDetectionSignalContent}>
                  <p className={s.projectDetectionSignalTitle}>{signal.label}</p>
                  {signal.description ? (
                    <p className={s.projectDetectionSignalDescription}>{signal.description}</p>
                  ) : null}
                  {signal.source ? (
                    <p className={s.projectDetectionSignalSource}>
                      {t('repository.projectDetection.signalSource', {
                        source: signal.source,
                      })}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </Card>
  );
};
