import { Folder, GitBranch, GitCommit, GitFork, Scale, Star, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatNumber } from '@/shared/lib/format-number';
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

export const RepositorySummary = ({
  asideAction,
  headerAction,
  repository,
}: RepositorySummaryProps) => {
  const { t } = useTranslation('dashboard');

  const repositoryFullName = `${repository.owner}/${repository.name}`;

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
    </Card>
  );
};
