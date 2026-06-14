import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLazyListRepositoryBranchesQuery } from './reportAnalysisApi';
import { getRepositoryAnalysisSubmitError } from './repositoryAnalysisErrors';

import type { ListRepositoryBranchesApiResponse } from './reportAnalysisApi';
import type { RepositoryAnalysisFormValues } from './repositoryAnalysisSchema';
import type { ParsedRepositoryInput } from './repositoryAnalysisTypes';
import type { TFunction } from 'i18next';
import type { UseFormClearErrors, UseFormSetError, UseFormSetValue } from 'react-hook-form';

const repositoryAccessErrorMessageKeys = {
  githubRateLimited: 'form.errors.githubRateLimited',
  githubUnavailable: 'form.errors.githubUnavailable',
  repositoryForbidden: 'form.errors.repositoryForbidden',
  repositoryNotFound: 'form.errors.repositoryNotFound',
  repositoryVerificationFailed: 'form.errors.repositoryVerificationFailed',
  serviceUnavailable: 'form.errors.serviceUnavailable',
} as const;

const getRepositoryAccessErrorMessageKey = (error: unknown) => {
  const submitError = getRepositoryAnalysisSubmitError(error);

  if (!submitError || !(submitError in repositoryAccessErrorMessageKeys)) {
    return null;
  }

  return repositoryAccessErrorMessageKeys[
    submitError as keyof typeof repositoryAccessErrorMessageKeys
  ];
};

interface UseRepositoryBranchSelectorOptions {
  branchValue: string;
  clearErrors: UseFormClearErrors<RepositoryAnalysisFormValues>;
  parsedRepository: ParsedRepositoryInput | null;
  setError: UseFormSetError<RepositoryAnalysisFormValues>;
  setValue: UseFormSetValue<RepositoryAnalysisFormValues>;
  t: TFunction<'repository-analysis'>;
}

export const useRepositoryBranchSelector = ({
  branchValue,
  clearErrors,
  parsedRepository,
  setError,
  setValue,
  t,
}: UseRepositoryBranchSelectorOptions) => {
  const [isBranchManual, setIsBranchManual] = useState(false);
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
  const activeBranchRepositoryKeyRef = useRef<string | null>(null);
  const [loadRepositoryBranches] = useLazyListRepositoryBranchesQuery();
  const branchRepositoryKey = parsedRepository
    ? `${parsedRepository.owner}/${parsedRepository.repository}`
    : null;
  const branchesData =
    branchRepositoryKey && loadedBranchesRepositoryKey === branchRepositoryKey
      ? loadedBranchesData
      : undefined;
  const isBranchesError = branchLoadErrorRepositoryKey === branchRepositoryKey;
  const isBranchLoading =
    Boolean(branchRepositoryKey) && loadingBranchesRepositoryKey === branchRepositoryKey;
  const branchOptions = useMemo(
    () =>
      branchesData?.branches.map((branch) => ({
        label: branch.isDefault ? `${branch.name} (${t('form.branchDefault')})` : branch.name,
        value: branch.name,
      })) ?? [],
    [branchesData?.branches, t],
  );
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
  const branchHint = isBranchLoading
    ? t('form.branchLoading')
    : isBranchesError
      ? t('form.branchLoadFailedHint')
      : t('form.branchHint');
  const branchPlaceholder = isBranchLoading
    ? t('form.branchLoading')
    : isBranchesError
      ? t('form.branchUnavailablePlaceholder')
      : t('form.branchPlaceholder');

  useEffect(() => {
    activeBranchRepositoryKeyRef.current = branchRepositoryKey;
  }, [branchRepositoryKey]);

  const loadBranchesForCurrentRepository = useCallback(() => {
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
          const repositoryErrorMessageKey = getRepositoryAccessErrorMessageKey(error);

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
  }, [
    branchRepositoryKey,
    clearErrors,
    loadRepositoryBranches,
    loadedBranchesData,
    loadedBranchesRepositoryKey,
    parsedRepository,
    setError,
    t,
  ]);

  const resetBranchStateForRepository = useCallback(
    (nextBranchRepositoryKey: string | null, options: { hasTreePath?: boolean } = {}) => {
      const shouldKeepLoadedBranches =
        Boolean(nextBranchRepositoryKey) &&
        nextBranchRepositoryKey === branchRepositoryKey &&
        loadedBranchesRepositoryKey === branchRepositoryKey &&
        Boolean(loadedBranchesData);
      const nextBranchValue =
        shouldKeepLoadedBranches && !options.hasTreePath
          ? (loadedBranchesData?.defaultBranch ?? '')
          : '';

      setIsBranchManual(false);
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
      clearErrors('branch');
    },
    [branchRepositoryKey, clearErrors, loadedBranchesData, loadedBranchesRepositoryKey, setValue],
  );

  const clearBranchState = useCallback(() => {
    setIsBranchManual(false);
    activeBranchRepositoryKeyRef.current = null;
    setBranchLoadErrorRepositoryKey(null);
    setLoadedBranchesRepositoryKey(null);
    setLoadedBranchesData(null);
    setLoadingBranchesRepositoryKey(null);
    requestedBranchesRef.current = null;
    setValue('branch', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors('branch');
  }, [clearErrors, setValue]);

  const setSelectedBranch = useCallback(
    (branch: string) => {
      if (branchValue !== branch) {
        setValue('branch', branch, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      clearErrors('branch');
    },
    [branchValue, clearErrors, setValue],
  );

  return {
    branchHint,
    branchOptions,
    branchPlaceholder,
    branchRepositoryKey,
    branchesData,
    clearBranchState,
    isBranchLoading,
    isBranchManual,
    isBranchesError,
    isBranchSelectorVisible: Boolean(parsedRepository),
    loadBranchesForCurrentRepository,
    renderedBranchOptions,
    resetBranchStateForRepository,
    setIsBranchManual,
    setSelectedBranch,
  };
};
