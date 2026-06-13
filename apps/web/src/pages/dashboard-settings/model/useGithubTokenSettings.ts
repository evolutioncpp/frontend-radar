import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  clearGithubToken,
  selectGithubToken,
  setGithubToken,
  useValidateGithubTokenInputMutation,
} from '@/features/app-settings';
import { getGithubTokenValidationError } from '@/features/app-settings/model/githubTokenErrors';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';

import { getMaskedGithubToken } from './githubTokenSettings';

type GithubTokenValidationState = 'idle' | 'invalid' | 'success' | 'error';

export const useGithubTokenSettings = () => {
  const { t } = useTranslation('settings');
  const dispatch = useAppDispatch();
  const savedGithubToken = useAppSelector(selectGithubToken);
  const [githubTokenInput, setGithubTokenInput] = useState(savedGithubToken ?? '');
  const [validationState, setValidationState] = useState<GithubTokenValidationState>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validateGithubToken, { isLoading: isTokenValidationLoading }] =
    useValidateGithubTokenInputMutation();
  const normalizedGithubToken = githubTokenInput.trim();
  const isTokenSaved = Boolean(savedGithubToken);
  const maskedGithubToken = useMemo(
    () => (savedGithubToken ? getMaskedGithubToken(savedGithubToken) : null),
    [savedGithubToken],
  );

  const resetValidation = () => {
    setValidationState('idle');
    setValidationError(null);
  };

  const setGithubTokenValue = (value: string) => {
    setGithubTokenInput(value);
    resetValidation();
  };

  const clearSavedGithubToken = () => {
    dispatch(clearGithubToken());
    setGithubTokenInput('');
    resetValidation();
  };

  const validateAndSaveGithubToken = async () => {
    if (!normalizedGithubToken) {
      setValidationState('invalid');
      setValidationError(t('githubAccess.validation.missing'));
      return;
    }

    try {
      await validateGithubToken(normalizedGithubToken).unwrap();
      dispatch(setGithubToken(normalizedGithubToken));
      setGithubTokenInput(normalizedGithubToken);
      setValidationState('success');
      setValidationError(null);
    } catch (error) {
      setValidationState('error');
      setValidationError(
        t(`githubAccess.validation.errors.${getGithubTokenValidationError(error)}`),
      );
    }
  };

  return {
    clearSavedGithubToken,
    githubTokenInput,
    isTokenSaved,
    isTokenValidationLoading,
    maskedGithubToken,
    setGithubTokenValue,
    validateAndSaveGithubToken,
    validationError,
    validationState,
  };
};
