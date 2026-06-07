import { useTranslation } from 'react-i18next';

import {
  RepositoryAnalysisForm,
  type RepositoryAnalysisRequest,
} from '@/features/repository-analysis';
import { Card } from '@/shared/ui/Card';

import s from './RepositoryAnalysisPanel.module.scss';

interface RepositoryAnalysisPanelProps {
  onSubmit: (request: RepositoryAnalysisRequest) => void;
}

export const RepositoryAnalysisPanel = ({ onSubmit }: RepositoryAnalysisPanelProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <Card className={s.repositoryAnalysisPanel}>
      <section className={s.header}>
        <p className={s.label}>{t('page.label')}</p>

        <h1 className={s.title}>{t('page.title')}</h1>

        <p className={s.description}>{t('page.description')}</p>
      </section>

      <RepositoryAnalysisForm onSubmit={onSubmit} />
    </Card>
  );
};
