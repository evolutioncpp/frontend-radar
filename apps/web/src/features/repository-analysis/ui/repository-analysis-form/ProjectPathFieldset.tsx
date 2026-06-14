import { useTranslation } from 'react-i18next';

import { Checkbox } from '@/shared/ui/Checkbox';
import { TextInput } from '@/shared/ui/TextInput';

import s from './RepositoryAnalysisForm.module.scss';

import type { ChangeEventHandler } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface ProjectPathFieldsetState {
  clearManualProjectPath: () => void;
  handleProjectPathChange: ChangeEventHandler<HTMLInputElement>;
  handleProjectPathToggleChange: ChangeEventHandler<HTMLInputElement>;
  isProjectPathEnabled: boolean;
  projectPathError?: string;
  projectPathField: UseFormRegisterReturn<'projectPath'>;
  projectPathToggleField: UseFormRegisterReturn<'useProjectPath'>;
  projectPathValue: string;
}

interface ProjectPathFieldsetProps {
  state: ProjectPathFieldsetState;
}

export const ProjectPathFieldset = ({ state }: ProjectPathFieldsetProps) => {
  const { t } = useTranslation('repository-analysis');

  return (
    <>
      <Checkbox
        {...state.projectPathToggleField}
        checked={state.isProjectPathEnabled}
        hint={t('form.projectPathToggleHint')}
        label={t('form.projectPathToggle')}
        onChange={state.handleProjectPathToggleChange}
        wrapperClassName={s.projectPathToggle}
      />

      {state.isProjectPathEnabled ? (
        <TextInput
          {...state.projectPathField}
          autoComplete="off"
          clearButtonLabel={t('form.projectPathClear')}
          error={state.projectPathError}
          hint={t('form.projectPathHint')}
          label={t('form.projectPathLabel')}
          onChange={state.handleProjectPathChange}
          onClear={state.clearManualProjectPath}
          placeholder={t('form.projectPathPlaceholder')}
          type="text"
          value={state.projectPathValue}
          wrapperClassName={s.projectPathInput}
        />
      ) : null}
    </>
  );
};
