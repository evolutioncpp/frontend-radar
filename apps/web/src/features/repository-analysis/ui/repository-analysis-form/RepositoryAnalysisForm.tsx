import { zodResolver } from '@hookform/resolvers/zod';
import { GitBranch, Search } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/Button';
import { TextInput } from '@/shared/ui/TextInput';

import s from './RepositoryAnalysisForm.module.scss';
import {
  createRepositoryAnalysisFormSchema,
  type RepositoryAnalysisFormSubmitResult,
  type RepositoryAnalysisFormValues,
} from '../../model/repositoryAnalysisSchema';

import type { RepositoryAnalysisRequest } from '../../model/repositoryAnalysisTypes';
import type { RepositoryAnalysisSubmitError } from '../../model/useRepositoryAnalysisSubmit';
import type { ChangeEventHandler } from 'react';

interface RepositoryAnalysisFormProps {
  isSubmitting?: boolean;
  onChange?: () => void;
  onSubmit: (request: RepositoryAnalysisRequest) => void;
  submitError?: RepositoryAnalysisSubmitError;
}

export const RepositoryAnalysisForm = ({
  isSubmitting = false,
  onChange,
  onSubmit,
  submitError = null,
}: RepositoryAnalysisFormProps) => {
  const { t } = useTranslation('repository-analysis');
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    control,
    register,
    setValue,
  } = useForm<RepositoryAnalysisFormValues, unknown, RepositoryAnalysisFormSubmitResult>({
    defaultValues: {
      repository: '',
    },
    resolver: zodResolver(createRepositoryAnalysisFormSchema(t('form.errors.invalidRepository'))),
  });
  const repositoryValue = useWatch({
    control,
    name: 'repository',
  });
  const repositoryInputValue = repositoryValue ?? '';

  const repositoryField = register('repository');
  const submitForm = handleSubmit((request) => onSubmit(request));
  const submitErrorMessage = submitError ? t(`form.errors.${submitError}`) : undefined;
  const repositoryError = errors.repository?.message ?? submitErrorMessage;

  const handleRepositoryChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void repositoryField.onChange(event);
    onChange?.();
  };

  const clearRepository = () => {
    setValue('repository', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors('repository');
    onChange?.();
  };

  return (
    <form className={s.repositoryAnalysisForm} onSubmit={(event) => void submitForm(event)}>
      <TextInput
        {...repositoryField}
        autoComplete="url"
        clearButtonLabel={t('form.clear')}
        error={repositoryError}
        hint={t('form.hint')}
        label={t('form.label')}
        leftIcon={<GitBranch aria-hidden="true" strokeWidth={2} />}
        onChange={handleRepositoryChange}
        onClear={clearRepository}
        placeholder={t('form.placeholder')}
        type="text"
        value={repositoryInputValue}
        wrapperClassName={s.input}
      />

      <Button className={s.submitButton} disabled={isSubmitting} type="submit">
        <Search aria-hidden="true" strokeWidth={2} />
        <span>{isSubmitting ? t('form.submitLoading') : t('form.submit')}</span>
      </Button>
    </form>
  );
};
