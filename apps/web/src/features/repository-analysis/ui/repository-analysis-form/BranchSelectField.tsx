import { useTranslation } from 'react-i18next';

import { Select } from '@/shared/ui/Select';

import s from './RepositoryAnalysisForm.module.scss';

import type { SelectOption } from '@/shared/ui/Select';
import type { ReactNode } from 'react';

export interface BranchSelectFieldState {
  branchError?: string;
  branchHint?: ReactNode;
  branchOptions: SelectOption[];
  branchPlaceholder: string;
  branchValue: string;
  handleBranchChange: (value: string) => void;
  handleBranchSelectOpen: () => void;
  isBranchLoading: boolean;
  isBranchSelectorVisible: boolean;
  isBranchesError: boolean;
  renderedBranchOptions: SelectOption[];
}

interface BranchSelectFieldProps {
  disabled: boolean;
  state: BranchSelectFieldState;
}

export const BranchSelectField = ({ disabled, state }: BranchSelectFieldProps) => {
  const { t } = useTranslation('repository-analysis');

  if (!state.isBranchSelectorVisible) {
    return null;
  }

  return (
    <Select
      disabled={disabled}
      error={state.branchError}
      hint={state.branchHint}
      label={t('form.branchLabel')}
      onOpen={state.handleBranchSelectOpen}
      onValueChange={state.handleBranchChange}
      options={state.renderedBranchOptions}
      placeholder={state.branchPlaceholder}
      searchable={!state.isBranchLoading && state.branchOptions.length > 0}
      searchPlaceholder={t('form.branchSearchPlaceholder')}
      emptyMessage={
        state.isBranchesError ? t('form.branchLoadFailedOption') : t('form.branchPlaceholder')
      }
      emptySearchMessage={t('form.branchSearchEmpty')}
      value={state.branchValue}
      wrapperClassName={s.branchSelect}
    />
  );
};
