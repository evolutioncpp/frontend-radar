import { BranchIcon, ForkIcon, LicenseIcon, StarIcon } from '@/shared/assets/icons/github';
import { formatNumber } from '@/shared/lib/format-number';
import { Card } from '@/shared/ui/Card';

import s from './RepositorySummary.module.scss';

import type { ReportRepository } from '@/entities/report';
import type { ComponentType, SVGProps } from 'react';

interface RepositorySummaryProps {
  repository: ReportRepository;
}

type MetaItem = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  isCode?: boolean;
};

export const RepositorySummary = ({ repository }: RepositorySummaryProps) => {
  const repositoryFullName = `${repository.owner}/${repository.name}`;

  const metaItems: MetaItem[] = [
    {
      icon: StarIcon,
      label: 'Stars',
      value: formatNumber(repository.stars),
    },
    {
      icon: ForkIcon,
      label: 'Forks',
      value: formatNumber(repository.forks),
    },
    {
      icon: BranchIcon,
      label: 'Branch',
      value: repository.defaultBranch,
      isCode: true,
    },
    {
      icon: LicenseIcon,
      label: 'License',
      value: repository.license ?? 'Unknown',
    },
  ];

  return (
    <Card className={s.repositorySummary}>
      <div className={s.header}>
        <div className={s.main}>
          <p className={s.label}>Repository</p>

          <h2 className={s.title}>{repositoryFullName}</h2>

          {repository.description ? (
            <p className={s.description}>{repository.description}</p>
          ) : null}
        </div>

        <a className={s.repositoryLink} href={repository.url} rel="noreferrer" target="_blank">
          Open repository
        </a>
      </div>

      <dl aria-label="Repository metadata" className={s.metaList}>
        {metaItems.map((item) => {
          const Icon = item.icon;

          return (
            <div className={s.metaItem} key={item.label}>
              <dt className={s.metaLabel}>
                <Icon aria-hidden="true" className={s.metaIcon} />
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
