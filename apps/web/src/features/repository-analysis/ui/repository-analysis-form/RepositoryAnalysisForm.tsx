import { resolveGithubTreePath } from '@frontend-radar/github-repository';
import { zodResolver } from '@hookform/resolvers/zod';
import { GitBranch, Search } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';

import s from './RepositoryAnalysisForm.module.scss';
import { useProjectPathAutofill } from './useProjectPathAutofill';
import { useRepositoryBranchSelector } from './useRepositoryBranchSelector';
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
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    control,
    register,
    setError,
    setValue,
  } = useForm<RepositoryAnalysisFormValues, unknown, RepositoryAnalysisFormSubmitResult>({
    defaultValues: {
      branch: '',
      projectPath: '',
      projectPathSource: '',
      repository: '',
      useProjectPath: false,
    },
    resolver: zodResolver(
      createRepositoryAnalysisFormSchema(
        t('form.errors.invalidRepository'),
        t('form.errors.invalidProjectPath'),
        t('form.errors.invalidBranch'),
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
  const branchValue =
    useWatch({
      control,
      name: 'branch',
    }) ?? '';
  const repositoryInputValue = repositoryValue ?? '';
  const parsedRepository = useMemo(
    () => parseRepositoryInput(repositoryInputValue),
    [repositoryInputValue],
  );
  const {
    clearManualProjectPath,
    clearProjectPath,
    handleProjectPathChange: handleProjectPathAutofillChange,
    handleProjectPathToggleChange: handleProjectPathAutofillToggleChange,
    isProjectPathDisabledByUser,
    isProjectPathManual,
    resetProjectPath,
    setUrlProjectPath,
    syncProjectPathFromRepository,
  } = useProjectPathAutofill({
    clearErrors,
    isProjectPathEnabled,
    onChange,
    parsedRepository,
    setValue,
  });

  const repositoryField = register('repository');
  const projectPathField = register('projectPath');
  const projectPathToggleField = register('useProjectPath');
  const submitErrorMessage = submitError ? t(`form.errors.${submitError}`) : undefined;
  const repositoryError = errors.repository?.message ?? submitErrorMessage;
  const projectPathError = errors.projectPath?.message;
  const {
    branchHint,
    branchOptions,
    branchesData,
    clearBranchState,
    isBranchLoading,
    isBranchManual,
    isBranchesError,
    isBranchSelectorVisible,
    loadBranchesForCurrentRepository,
    renderedBranchOptions,
    resetBranchStateForRepository,
    setIsBranchManual,
    setSelectedBranch,
    branchPlaceholder,
  } = useRepositoryBranchSelector({
    branchValue,
    clearErrors,
    parsedRepository,
    setError,
    setValue,
    t,
  });
  const branchError =
    errors.branch?.message ?? (isBranchesError ? t('form.errors.branchLoadFailed') : undefined);
  const isSubmitDisabled = isSubmitting || isBranchLoading;

  const resolveTreePathBeforeSubmit = async (request: RepositoryAnalysisRequest) => {
    if (!parsedRepository?.treePath) {
      return request;
    }

    const loadedBranches = branchesData ?? (await loadBranchesForCurrentRepository());

    if (!loadedBranches) {
      setError('branch', {
        message: t('form.errors.branchLoadFailed'),
        type: 'manual',
      });

      return null;
    }

    const treeResolution = resolveGithubTreePath(
      parsedRepository.treePath,
      loadedBranches.branches.map((branch) => branch.name),
    );

    if (!treeResolution) {
      setError('branch', {
        message: t('form.errors.branchNotFound'),
        type: 'manual',
      });

      return null;
    }

    const resolvedRequest: RepositoryAnalysisRequest = {
      ...request,
      branch: isBranchManual && request.branch ? request.branch : treeResolution.branch,
    };

    setValue('branch', resolvedRequest.branch ?? '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors('branch');

    if (treeResolution.projectPath && !isProjectPathManual && !isProjectPathDisabledByUser) {
      resolvedRequest.projectPath = treeResolution.projectPath;
      resolvedRequest.projectPathSource = 'url';

      setUrlProjectPath(treeResolution.projectPath);
    }

    return resolvedRequest;
  };

  const handleRepositorySubmit = async (request: RepositoryAnalysisRequest) => {
    const resolvedRequest = await resolveTreePathBeforeSubmit(request);

    if (!resolvedRequest) {
      return;
    }

    onSubmit(resolvedRequest);
  };

  useEffect(() => {
    if (!parsedRepository || !branchesData) {
      return;
    }

    const branchNames = branchesData.branches.map((branch) => branch.name);

    if (isBranchManual) {
      if (branchValue && branchNames.includes(branchValue)) {
        return;
      }
    }

    const treeResolution = parsedRepository.treePath
      ? resolveGithubTreePath(parsedRepository.treePath, branchNames)
      : null;
    const nextBranch = treeResolution?.branch ?? branchesData.defaultBranch;

    setSelectedBranch(nextBranch);

    if (!parsedRepository.treePath || isProjectPathManual || isProjectPathDisabledByUser) {
      return;
    }

    if (treeResolution?.projectPath) {
      setUrlProjectPath(treeResolution.projectPath);

      return;
    }

    setValue('useProjectPath', false, {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearProjectPath();
  }, [
    branchValue,
    branchesData,
    clearProjectPath,
    isBranchManual,
    isProjectPathDisabledByUser,
    isProjectPathManual,
    parsedRepository,
    setSelectedBranch,
    setUrlProjectPath,
    setValue,
  ]);

  const handleRepositoryChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void repositoryField.onChange(event);
    const parsedRepository = parseRepositoryInput(event.target.value);
    const nextBranchRepositoryKey = parsedRepository
      ? `${parsedRepository.owner}/${parsedRepository.repository}`
      : null;

    resetBranchStateForRepository(nextBranchRepositoryKey, {
      hasTreePath: Boolean(parsedRepository?.treePath),
    });
    clearErrors('repository');

    syncProjectPathFromRepository(parsedRepository);

    onChange?.();
  };

  const handleBranchChange = (value: string) => {
    setIsBranchManual(true);
    setValue('branch', value, {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors('branch');
    onChange?.();
  };

  const handleBranchSelectOpen = () => {
    if (isBranchesError) {
      return;
    }

    void loadBranchesForCurrentRepository();
  };

  const handleProjectPathToggleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void projectPathToggleField.onChange(event);
    handleProjectPathAutofillToggleChange(event);
  };

  const handleProjectPathChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    handleProjectPathAutofillChange(event);
    void projectPathField.onChange(event);
  };

  const clearRepository = () => {
    setValue('repository', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearBranchState();
    resetProjectPath();
    clearErrors('repository');
    clearErrors('projectPath');
    onChange?.();
  };

  return (
    <form
      className={s.repositoryAnalysisForm}
      onSubmit={(event) => {
        void handleSubmit(handleRepositorySubmit)(event);
      }}
    >
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

        {isBranchSelectorVisible ? (
          <Select
            disabled={isSubmitting}
            error={branchError}
            hint={branchHint}
            label={t('form.branchLabel')}
            onOpen={handleBranchSelectOpen}
            onValueChange={handleBranchChange}
            options={renderedBranchOptions}
            placeholder={branchPlaceholder}
            searchable={!isBranchLoading && branchOptions.length > 0}
            searchPlaceholder={t('form.branchSearchPlaceholder')}
            emptyMessage={
              isBranchesError ? t('form.branchLoadFailedOption') : t('form.branchPlaceholder')
            }
            emptySearchMessage={t('form.branchSearchEmpty')}
            value={branchValue}
            wrapperClassName={s.branchSelect}
          />
        ) : null}

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
              clearManualProjectPath();
            }}
            placeholder={t('form.projectPathPlaceholder')}
            type="text"
            value={projectPathValue}
            wrapperClassName={s.projectPathInput}
          />
        ) : null}
      </div>

      <Button className={s.submitButton} disabled={isSubmitDisabled} type="submit">
        <Search aria-hidden="true" strokeWidth={2} />
        <span>{isSubmitting ? t('form.submitLoading') : t('form.submit')}</span>
      </Button>
    </form>
  );
};
