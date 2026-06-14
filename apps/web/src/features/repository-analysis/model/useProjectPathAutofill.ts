import { useCallback, useState } from 'react';

import type { RepositoryAnalysisFormValues } from './repositoryAnalysisSchema';
import type { ParsedRepositoryInput } from './repositoryAnalysisTypes';
import type { ChangeEventHandler } from 'react';
import type { UseFormClearErrors, UseFormSetValue } from 'react-hook-form';

interface UseProjectPathAutofillOptions {
  clearErrors: UseFormClearErrors<RepositoryAnalysisFormValues>;
  isProjectPathEnabled: boolean;
  onChange?: () => void;
  parsedRepository: ParsedRepositoryInput | null;
  setValue: UseFormSetValue<RepositoryAnalysisFormValues>;
}

export const useProjectPathAutofill = ({
  clearErrors,
  isProjectPathEnabled,
  onChange,
  parsedRepository,
  setValue,
}: UseProjectPathAutofillOptions) => {
  const [isProjectPathManual, setIsProjectPathManual] = useState(false);
  const [isProjectPathDisabledByUser, setIsProjectPathDisabledByUser] = useState(false);

  const setUrlProjectPath = useCallback(
    (projectPath: string) => {
      setValue('useProjectPath', true, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPath', projectPath, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('projectPathSource', 'url', {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('projectPath');
    },
    [clearErrors, setValue],
  );

  const clearProjectPath = useCallback(() => {
    setValue('projectPath', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('projectPathSource', '', {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearErrors('projectPath');
  }, [clearErrors, setValue]);

  const resetProjectPath = useCallback(() => {
    setIsProjectPathManual(false);
    setIsProjectPathDisabledByUser(false);
    setValue('useProjectPath', false, {
      shouldDirty: true,
      shouldTouch: true,
    });
    clearProjectPath();
  }, [clearProjectPath, setValue]);

  const syncProjectPathFromRepository = useCallback(
    (repository: ParsedRepositoryInput | null) => {
      setIsProjectPathDisabledByUser(false);

      if (repository?.projectPath && !isProjectPathManual) {
        setUrlProjectPath(repository.projectPath);
        return;
      }

      if (!repository?.projectPath && !isProjectPathManual && isProjectPathEnabled) {
        setValue('useProjectPath', false, {
          shouldDirty: true,
          shouldTouch: true,
        });
        clearProjectPath();
      }
    },
    [clearProjectPath, isProjectPathEnabled, isProjectPathManual, setUrlProjectPath, setValue],
  );

  const handleProjectPathToggleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (!event.target.checked) {
        setIsProjectPathManual(false);
        setIsProjectPathDisabledByUser(true);
        clearProjectPath();
      } else {
        setIsProjectPathDisabledByUser(false);

        if (parsedRepository?.projectPath && !isProjectPathManual) {
          setUrlProjectPath(parsedRepository.projectPath);
        }
      }

      onChange?.();
    },
    [clearProjectPath, isProjectPathManual, onChange, parsedRepository, setUrlProjectPath],
  );

  const handleProjectPathChange: ChangeEventHandler<HTMLInputElement> = useCallback(() => {
    setIsProjectPathManual(true);
    setIsProjectPathDisabledByUser(false);
    setValue('projectPathSource', 'manual', {
      shouldDirty: true,
      shouldTouch: true,
    });
    onChange?.();
  }, [onChange, setValue]);

  const clearManualProjectPath = useCallback(() => {
    setIsProjectPathManual(false);
    clearProjectPath();
    onChange?.();
  }, [clearProjectPath, onChange]);

  return {
    clearManualProjectPath,
    clearProjectPath,
    handleProjectPathChange,
    handleProjectPathToggleChange,
    isProjectPathDisabledByUser,
    isProjectPathManual,
    resetProjectPath,
    setUrlProjectPath,
    syncProjectPathFromRepository,
  };
};
