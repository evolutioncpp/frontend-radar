import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/Button';

import s from './RepositoryAnalysisForm.module.scss';

interface RepositoryAnalysisSubmitButtonProps {
  isDisabled: boolean;
  isSubmitting: boolean;
}

export const RepositoryAnalysisSubmitButton = ({
  isDisabled,
  isSubmitting,
}: RepositoryAnalysisSubmitButtonProps) => {
  const { t } = useTranslation('repository-analysis');

  return (
    <Button className={s.submitButton} disabled={isDisabled} type="submit">
      <Search aria-hidden="true" strokeWidth={2} />
      <span>{isSubmitting ? t('form.submitLoading') : t('form.submit')}</span>
    </Button>
  );
};
