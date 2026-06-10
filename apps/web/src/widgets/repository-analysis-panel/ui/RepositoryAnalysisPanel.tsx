import { useTranslation } from 'react-i18next';

import {
  RepositoryAnalysisForm,
  type RepositoryAnalysisSubmitError,
  type RepositoryAnalysisRequest,
} from '@/features/repository-analysis';
import { Card } from '@/shared/ui/Card';

import s from './RepositoryAnalysisPanel.module.scss';

interface RepositoryAnalysisPanelProps {
  id?: string;
  isSubmitting?: boolean;
  onChange?: () => void;
  onSubmit: (request: RepositoryAnalysisRequest) => void;
  submitError?: RepositoryAnalysisSubmitError;
}

export const RepositoryAnalysisPanel = ({
  id,
  isSubmitting = false,
  onChange,
  onSubmit,
  submitError = null,
}: RepositoryAnalysisPanelProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <Card className={s.repositoryAnalysisPanel} id={id}>
      <section className={s.header}>
        <p className={s.label}>{t('page.label')}</p>

        <h1 className={s.title}>{t('page.title')}</h1>

        <p className={s.description}>{t('page.description')}</p>
      </section>

      <RepositoryAnalysisForm
        isSubmitting={isSubmitting}
        onChange={onChange}
        onSubmit={onSubmit}
        submitError={submitError}
      />
    </Card>
  );
};
