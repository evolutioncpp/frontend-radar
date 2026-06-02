import { formatNumber } from '@/shared/lib/format-number';
import { Card } from '@/shared/ui/Card';

import s from './RepositorySummary.module.scss';

import type { ReportRepository } from '@/entities/report';

interface RepositorySummaryProps {
  repository: ReportRepository;
}

export const RepositorySummary = ({ repository }: RepositorySummaryProps) => {
  const repositoryFullName = `${repository.owner}/${repository.name}`;

  return (
    <Card className={s.repositorySummary}>
      <div className={s.header}>
        <div className={s.headerInfo}>
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

      <dl className={s.metaList}>
        <div className={s.metaItem}>
          <dt>Stars</dt>
          <dd>{formatNumber(repository.stars)}</dd>
        </div>

        <div className={s.metaItem}>
          <dt>Forks</dt>
          <dd>{formatNumber(repository.forks)}</dd>
        </div>

        <div className={s.metaItem}>
          <dt>Default branch</dt>
          <dd>{repository.defaultBranch}</dd>
        </div>

        <div className={s.metaItem}>
          <dt>License</dt>
          <dd>{repository.license ?? 'Unknown'}</dd>
        </div>
      </dl>
    </Card>
  );
};
