import { resolveGithubTreePath } from '@frontend-radar/github-repository';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { parseRepositoryInput } from './parseRepositoryInput';
import {
  createRepositoryAnalysisFormSchema,
  type RepositoryAnalysisFormSubmitResult,
  type RepositoryAnalysisFormValues,
} from './repositoryAnalysisSchema';
import { resolveRepositoryTreeSubmitRequest } from './resolveRepositoryTreeSubmitRequest';
import { useProjectPathAutofill } from './useProjectPathAutofill';
import { useRepositoryBranchSelector } from './useRepositoryBranchSelector';

import type { RepositoryAnalysisRequest } from './repositoryAnalysisTypes';
import type { RepositoryAnalysisSubmitError } from './useRepositoryAnalysisSubmit';
import type { ChangeEventHandler } from 'react';

interface UseRepositoryAnalysisFormControllerParams {
  isSubmitting: boolean;
  onChange?: () => void;
  onSubmit: (request: RepositoryAnalysisRequest) => void;
  submitError: RepositoryAnalysisSubmitError;
}

export const useRepositoryAnalysisFormController = ({
  isSubmitting,
  onChange,
  onSubmit,
  submitError,
}: UseRepositoryAnalysisFormControllerParams) => {
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

  const handleRepositorySubmit = async (request: RepositoryAnalysisRequest) => {
    const resolvedTreeSubmit = await resolveRepositoryTreeSubmitRequest({
      branchesData: branchesData ?? undefined,
      isBranchManual,
      isProjectPathDisabledByUser,
      isProjectPathManual,
      loadBranchesForCurrentRepository,
      parsedRepository,
      request,
    });

    if (resolvedTreeSubmit.status === 'error' && resolvedTreeSubmit.error === 'branchLoadFailed') {
      setError('branch', {
        message: t('form.errors.branchLoadFailed'),
        type: 'manual',
      });

      return;
    }

    if (resolvedTreeSubmit.status === 'error') {
      setError('branch', {
        message: t('form.errors.branchNotFound'),
        type: 'manual',
      });

      return;
    }

    setValue('branch', resolvedTreeSubmit.resolvedBranch ?? '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors('branch');

    if (resolvedTreeSubmit.projectPathFromUrl) {
      setUrlProjectPath(resolvedTreeSubmit.projectPathFromUrl);
    }

    onSubmit(resolvedTreeSubmit.request);
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

  return {
    branch: {
      branchError,
      branchHint,
      branchOptions,
      branchPlaceholder,
      branchValue,
      handleBranchChange,
      handleBranchSelectOpen,
      isBranchLoading,
      isBranchSelectorVisible,
      isBranchesError,
      renderedBranchOptions,
    },
    form: {
      handleSubmit: handleSubmit(handleRepositorySubmit),
    },
    projectPath: {
      clearManualProjectPath,
      handleProjectPathChange,
      handleProjectPathToggleChange,
      isProjectPathEnabled,
      projectPathError,
      projectPathField,
      projectPathToggleField,
      projectPathValue,
    },
    repository: {
      clearRepository,
      handleRepositoryChange,
      repositoryError,
      repositoryField,
      repositoryInputValue,
    },
    submit: {
      isSubmitDisabled,
      isSubmitting,
    },
  };
};
