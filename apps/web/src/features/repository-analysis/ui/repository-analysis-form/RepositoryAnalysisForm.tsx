import { resolveGithubTreePath } from '@frontend-radar/github-repository';
import { zodResolver } from '@hookform/resolvers/zod';
import { GitBranch, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';

import s from './RepositoryAnalysisForm.module.scss';
import { parseRepositoryInput } from '../../model/parseRepositoryInput';
import { useLazyListRepositoryBranchesQuery } from '../../model/reportAnalysisApi';
import {
  createRepositoryAnalysisFormSchema,
  type RepositoryAnalysisFormSubmitResult,
  type RepositoryAnalysisFormValues,
} from '../../model/repositoryAnalysisSchema';

import type { ListRepositoryBranchesApiResponse } from '../../model/reportAnalysisApi';
import type { RepositoryAnalysisRequest } from '../../model/repositoryAnalysisTypes';
import type { RepositoryAnalysisSubmitError } from '../../model/useRepositoryAnalysisSubmit';
import type { ChangeEventHandler } from 'react';

interface RepositoryAnalysisFormProps {
  isSubmitting?: boolean;
  onChange?: () => void;
  onSubmit: (request: RepositoryAnalysisRequest) => void;
  submitError?: RepositoryAnalysisSubmitError;
}

const getApiErrorCode = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'code' in error.data &&
    typeof error.data.code === 'string'
  ) {
    return error.data.code;
  }

  return null;
};

const repositoryAccessErrorMessageKeys = {
  github_rate_limited: 'form.errors.githubRateLimited',
  github_unavailable: 'form.errors.githubUnavailable',
  repository_forbidden: 'form.errors.repositoryForbidden',
  repository_not_found: 'form.errors.repositoryNotFound',
  repository_verification_failed: 'form.errors.repositoryVerificationFailed',
} as const;

const getRepositoryAccessErrorMessageKey = (errorCode: string | null) => {
  if (!errorCode || !(errorCode in repositoryAccessErrorMessageKeys)) {
    return null;
  }

  return repositoryAccessErrorMessageKeys[
    errorCode as keyof typeof repositoryAccessErrorMessageKeys
  ];
};

export const RepositoryAnalysisForm = ({
  isSubmitting = false,
  onChange,
  onSubmit,
  submitError = null,
}: RepositoryAnalysisFormProps) => {
  const { t } = useTranslation('repository-analysis');
  const [isBranchManual, setIsBranchManual] = useState(false);
  const [isProjectPathManual, setIsProjectPathManual] = useState(false);
  const [isProjectPathDisabledByUser, setIsProjectPathDisabledByUser] = useState(false);
  const [branchLoadErrorRepositoryKey, setBranchLoadErrorRepositoryKey] = useState<string | null>(
    null,
  );
  const [loadedBranchesRepositoryKey, setLoadedBranchesRepositoryKey] = useState<string | null>(
    null,
  );
  const [loadingBranchesRepositoryKey, setLoadingBranchesRepositoryKey] = useState<string | null>(
    null,
  );
  const [loadedBranchesData, setLoadedBranchesData] =
    useState<ListRepositoryBranchesApiResponse | null>(null);
  const requestedBranchesRef = useRef<{
    key: string;
    promise: Promise<ListRepositoryBranchesApiResponse | null>;
  } | null>(null);
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
  const [loadRepositoryBranches] = useLazyListRepositoryBranchesQuery();
  const branchRepositoryKey = parsedRepository
    ? `${parsedRepository.owner}/${parsedRepository.repository}`
    : null;
  const activeBranchRepositoryKeyRef = useRef<string | null>(null);
  const branchesData =
    branchRepositoryKey && loadedBranchesRepositoryKey === branchRepositoryKey
      ? loadedBranchesData
      : undefined;
  const isBranchesError = branchLoadErrorRepositoryKey === branchRepositoryKey;
  const branchOptions = useMemo(
    () =>
      branchesData?.branches.map((branch) => ({
        label: branch.isDefault ? `${branch.name} (${t('form.branchDefault')})` : branch.name,
        value: branch.name,
      })) ?? [],
    [branchesData?.branches, t],
  );

  const repositoryField = register('repository');
  const branchField = register('branch');
  const projectPathField = register('projectPath');
  const projectPathToggleField = register('useProjectPath');
  const submitErrorMessage = submitError ? t(`form.errors.${submitError}`) : undefined;
  const repositoryError = errors.repository?.message ?? submitErrorMessage;
  const branchError =
    errors.branch?.message ?? (isBranchesError ? t('form.errors.branchLoadFailed') : undefined);
  const projectPathError = errors.projectPath?.message;
  const isBranchSelectorVisible = Boolean(parsedRepository);
  const isBranchLoading =
    Boolean(branchRepositoryKey) && loadingBranchesRepositoryKey === branchRepositoryKey;
  const branchHint = isBranchLoading
    ? t('form.branchLoading')
    : isBranchesError
      ? t('form.branchLoadFailedHint')
      : t('form.branchHint');
  const isSubmitDisabled = isSubmitting || isBranchLoading;
  const renderedBranchOptions = isBranchLoading
    ? [
        {
          disabled: true,
          label: t('form.branchLoading'),
          value: '__loading',
        },
      ]
    : isBranchesError
      ? [
          {
            disabled: true,
            label: t('form.branchLoadFailedOption'),
            value: '__error',
          },
        ]
      : branchOptions;
  const branchPlaceholder = isBranchLoading
    ? t('form.branchLoading')
    : isBranchesError
      ? t('form.branchUnavailablePlaceholder')
      : t('form.branchPlaceholder');

  useEffect(() => {
    activeBranchRepositoryKeyRef.current = branchRepositoryKey;
  }, [branchRepositoryKey]);

  const loadBranchesForCurrentRepository = () => {
    if (!parsedRepository || !branchRepositoryKey) {
      return Promise.resolve(null);
    }

    if (loadedBranchesRepositoryKey === branchRepositoryKey && loadedBranchesData) {
      return Promise.resolve(loadedBranchesData);
    }

    if (requestedBranchesRef.current?.key === branchRepositoryKey) {
      return requestedBranchesRef.current.promise;
    }

    const requestKey = branchRepositoryKey;
    setBranchLoadErrorRepositoryKey(null);
    setLoadingBranchesRepositoryKey(requestKey);
    activeBranchRepositoryKeyRef.current = requestKey;

    const requestPromise = loadRepositoryBranches(
      {
        owner: parsedRepository.owner,
        repository: parsedRepository.repository,
      },
      true,
    )
      .unwrap()
      .then((response) => {
        if (activeBranchRepositoryKeyRef.current === requestKey) {
          setLoadedBranchesRepositoryKey(requestKey);
          setLoadedBranchesData(response);
          setBranchLoadErrorRepositoryKey(null);
          clearErrors('repository');
        }

        return response;
      })
      .catch((error) => {
        if (activeBranchRepositoryKeyRef.current === requestKey) {
          const repositoryErrorMessageKey = getRepositoryAccessErrorMessageKey(
            getApiErrorCode(error),
          );

          setLoadedBranchesRepositoryKey(null);
          setLoadedBranchesData(null);
          setBranchLoadErrorRepositoryKey(requestKey);

          if (repositoryErrorMessageKey) {
            setError('repository', {
              message: t(repositoryErrorMessageKey),
              type: 'manual',
            });
          }
        }

        return null;
      })
      .finally(() => {
        if (requestedBranchesRef.current?.key === requestKey) {
          requestedBranchesRef.current = null;
        }

        setLoadingBranchesRepositoryKey((currentKey) =>
          currentKey === requestKey ? null : currentKey,
        );
      });

    requestedBranchesRef.current = {
      key: requestKey,
      promise: requestPromise,
    };

    return requestPromise;
  };

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

      setValue('useProjectPath', true, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPath', treeResolution.projectPath, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPathSource', 'url', {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('projectPath');
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

    if (branchValue !== nextBranch) {
      setValue('branch', nextBranch, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    clearErrors('branch');

    if (!parsedRepository.treePath || isProjectPathManual || isProjectPathDisabledByUser) {
      return;
    }

    if (treeResolution?.projectPath) {
      setValue('useProjectPath', true, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPath', treeResolution.projectPath, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPathSource', 'url', {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('projectPath');

      return;
    }

    setValue('useProjectPath', false, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('projectPath', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('projectPathSource', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors('projectPath');
  }, [
    branchValue,
    branchesData,
    clearErrors,
    isBranchManual,
    isProjectPathDisabledByUser,
    isProjectPathManual,
    parsedRepository,
    setValue,
  ]);

  const handleRepositoryChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    void repositoryField.onChange(event);
    const parsedRepository = parseRepositoryInput(event.target.value);
    const nextBranchRepositoryKey = parsedRepository
      ? `${parsedRepository.owner}/${parsedRepository.repository}`
      : null;
    const shouldKeepLoadedBranches =
      Boolean(nextBranchRepositoryKey) &&
      nextBranchRepositoryKey === branchRepositoryKey &&
      loadedBranchesRepositoryKey === branchRepositoryKey &&
      Boolean(loadedBranchesData);
    const nextBranchValue =
      shouldKeepLoadedBranches && !parsedRepository?.treePath
        ? (loadedBranchesData?.defaultBranch ?? '')
        : '';

    setIsBranchManual(false);
    setIsProjectPathDisabledByUser(false);
    activeBranchRepositoryKeyRef.current = nextBranchRepositoryKey;
    setBranchLoadErrorRepositoryKey(null);

    if (!shouldKeepLoadedBranches) {
      setLoadedBranchesRepositoryKey(null);
      setLoadedBranchesData(null);
    }

    setLoadingBranchesRepositoryKey(null);
    requestedBranchesRef.current = null;
    setValue('branch', nextBranchValue, {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors('repository');
    clearErrors('branch');

    if (parsedRepository?.projectPath && !isProjectPathManual) {
      setValue('useProjectPath', true, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPath', parsedRepository.projectPath, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPathSource', 'url', {
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
      setValue('projectPathSource', '', {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('projectPath');
    }

    onChange?.();
  };

  const handleBranchChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setIsBranchManual(true);
    void branchField.onChange(event);
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

    if (!event.target.checked) {
      setIsProjectPathManual(false);
      setIsProjectPathDisabledByUser(true);
      setValue('projectPath', '', {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPathSource', '', {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('projectPath');
    } else {
      const parsedRepository = parseRepositoryInput(repositoryInputValue);
      setIsProjectPathDisabledByUser(false);

      if (parsedRepository?.projectPath && !isProjectPathManual) {
        setValue('projectPath', parsedRepository.projectPath, {
          shouldDirty: true,
          shouldTouch: true,
        });
        setValue('projectPathSource', 'url', {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }

    onChange?.();
  };

  const handleProjectPathChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setIsProjectPathManual(true);
    setIsProjectPathDisabledByUser(false);
    setValue('projectPathSource', 'manual', {
      shouldDirty: true,
      shouldTouch: true,
    });
    void projectPathField.onChange(event);
    onChange?.();
  };

  const clearRepository = () => {
    setValue('repository', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('branch', '', {
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
    setValue('projectPathSource', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    setIsProjectPathManual(false);
    setIsProjectPathDisabledByUser(false);
    setIsBranchManual(false);
    activeBranchRepositoryKeyRef.current = null;
    setBranchLoadErrorRepositoryKey(null);
    setLoadedBranchesRepositoryKey(null);
    setLoadedBranchesData(null);
    setLoadingBranchesRepositoryKey(null);
    requestedBranchesRef.current = null;
    clearErrors('repository');
    clearErrors('branch');
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
            {...branchField}
            disabled={isSubmitting}
            error={branchError}
            hint={branchHint}
            label={t('form.branchLabel')}
            onChange={handleBranchChange}
            onOpen={handleBranchSelectOpen}
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
              setIsProjectPathManual(false);
              setValue('projectPath', '', {
                shouldDirty: true,
                shouldTouch: true,
              });
              setValue('projectPathSource', '', {
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

      <Button className={s.submitButton} disabled={isSubmitDisabled} type="submit">
        <Search aria-hidden="true" strokeWidth={2} />
        <span>{isSubmitting ? t('form.submitLoading') : t('form.submit')}</span>
      </Button>
    </form>
  );
};
