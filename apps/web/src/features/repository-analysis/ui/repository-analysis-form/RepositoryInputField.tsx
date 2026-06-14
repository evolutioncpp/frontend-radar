import { GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TextInput } from '@/shared/ui/TextInput';

import s from './RepositoryAnalysisForm.module.scss';

import type { ChangeEventHandler } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface RepositoryInputFieldState {
  clearRepository: () => void;
  handleRepositoryChange: ChangeEventHandler<HTMLInputElement>;
  repositoryError?: string;
  repositoryField: UseFormRegisterReturn<'repository'>;
  repositoryInputValue: string;
}

interface RepositoryInputFieldProps {
  state: RepositoryInputFieldState;
}

export const RepositoryInputField = ({ state }: RepositoryInputFieldProps) => {
  const { t } = useTranslation('repository-analysis');

  return (
    <TextInput
      {...state.repositoryField}
      autoComplete="url"
      clearButtonLabel={t('form.clear')}
      error={state.repositoryError}
      hint={t('form.hint')}
      label={t('form.label')}
      leftIcon={<GitBranch aria-hidden="true" strokeWidth={2} />}
      onChange={state.handleRepositoryChange}
      onClear={state.clearRepository}
      placeholder={t('form.placeholder')}
      type="text"
      value={state.repositoryInputValue}
      wrapperClassName={s.input}
    />
  );
};
