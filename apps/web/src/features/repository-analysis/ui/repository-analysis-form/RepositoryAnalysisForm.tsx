import { zodResolver } from '@hookform/resolvers/zod';
import { GitBranch, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { TextInput } from '@/shared/ui/TextInput';

import s from './RepositoryAnalysisForm.module.scss';
import { parseRepositoryInput } from '../../model/parseRepositoryInput';
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
  const [isProjectPathManual, setIsProjectPathManual] = useState(false);
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    control,
    register,
    setValue,
  } = useForm<RepositoryAnalysisFormValues, unknown, RepositoryAnalysisFormSubmitResult>({
    defaultValues: {
      projectPath: '',
      repository: '',
      useProjectPath: false,
    },
    resolver: zodResolver(
      createRepositoryAnalysisFormSchema(
        t('form.errors.invalidRepository'),
        t('form.errors.invalidProjectPath'),
      ),
    ),
  });
  const repositoryValue = useWatch({
    control,
    name: 'repository',
  });
  const isProjectPathEnabled =
    useWatch({
      control,
      name: 'useProjectPath',
    }) ?? false;
  const projectPathValue =
    useWatch({
      control,
      name: 'projectPath',
    }) ?? '';
  const repositoryInputValue = repositoryValue ?? '';

  const repositoryField = register('repository');
  const projectPathField = register('projectPath');
  const projectPathToggleField = register('useProjectPath');
  const submitForm = handleSubmit((request) => onSubmit(request));
  const submitErrorMessage = submitError ? t(`form.errors.${submitError}`) : undefined;
  const repositoryError = errors.repository?.message ?? submitErrorMessage;
  const projectPathError = errors.projectPath?.message;

  const handleRepositoryChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void repositoryField.onChange(event);
    const parsedRepository = parseRepositoryInput(event.target.value);

    if (parsedRepository?.projectPath && !isProjectPathManual) {
      setValue('useProjectPath', true, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPath', parsedRepository.projectPath, {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('projectPath');
    } else if (!parsedRepository?.projectPath && !isProjectPathManual && isProjectPathEnabled) {
      setValue('useProjectPath', false, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPath', '', {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('projectPath');
    }

    onChange?.();
  };

  const handleProjectPathToggleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void projectPathToggleField.onChange(event);

    if (!event.target.checked) {
      setIsProjectPathManual(false);
      setValue('projectPath', '', {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('projectPath');
    } else {
      const parsedRepository = parseRepositoryInput(repositoryInputValue);

      if (parsedRepository?.projectPath && !isProjectPathManual) {
        setValue('projectPath', parsedRepository.projectPath, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }

    onChange?.();
  };

  const handleProjectPathChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setIsProjectPathManual(true);
    void projectPathField.onChange(event);
    onChange?.();
  };

  const clearRepository = () => {
    setValue('repository', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('useProjectPath', false, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('projectPath', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    setIsProjectPathManual(false);
    clearErrors('repository');
    clearErrors('projectPath');
    onChange?.();
  };

  return (
    <form className={s.repositoryAnalysisForm} onSubmit={(event) => void submitForm(event)}>
      <div className={s.fields}>
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

        <Checkbox
          {...projectPathToggleField}
          checked={isProjectPathEnabled}
          hint={t('form.projectPathToggleHint')}
          label={t('form.projectPathToggle')}
          onChange={handleProjectPathToggleChange}
          wrapperClassName={s.projectPathToggle}
        />

        {isProjectPathEnabled ? (
          <TextInput
            {...projectPathField}
            autoComplete="off"
            clearButtonLabel={t('form.projectPathClear')}
            error={projectPathError}
            hint={t('form.projectPathHint')}
            label={t('form.projectPathLabel')}
            onChange={handleProjectPathChange}
            onClear={() => {
              setIsProjectPathManual(false);
              setValue('projectPath', '', {
                shouldDirty: true,
                shouldTouch: true,
              });
              clearErrors('projectPath');
              onChange?.();
            }}
            placeholder={t('form.projectPathPlaceholder')}
            type="text"
            value={projectPathValue}
            wrapperClassName={s.projectPathInput}
          />
        ) : null}
      </div>

      <Button className={s.submitButton} disabled={isSubmitting} type="submit">
        <Search aria-hidden="true" strokeWidth={2} />
        <span>{isSubmitting ? t('form.submitLoading') : t('form.submit')}</span>
      </Button>
    </form>
  );
};
