import { BranchSelectField } from './BranchSelectField';
import { ProjectPathFieldset } from './ProjectPathFieldset';
import s from './RepositoryAnalysisForm.module.scss';
import { RepositoryAnalysisSubmitButton } from './RepositoryAnalysisSubmitButton';
import { RepositoryInputField } from './RepositoryInputField';
import { useRepositoryAnalysisFormController } from '../../model/useRepositoryAnalysisFormController';

import type { RepositoryAnalysisRequest } from '../../model/repositoryAnalysisTypes';
import type { RepositoryAnalysisSubmitError } from '../../model/useRepositoryAnalysisSubmit';

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
  const controller = useRepositoryAnalysisFormController({
    isSubmitting,
    onChange,
    onSubmit,
    submitError,
  });

  return (
    <form
      className={s.repositoryAnalysisForm}
      onSubmit={(event) => {
        void controller.form.handleSubmit(event);
      }}
    >
      <div className={s.fields}>
        <RepositoryInputField state={controller.repository} />
        <BranchSelectField disabled={isSubmitting} state={controller.branch} />
        <ProjectPathFieldset state={controller.projectPath} />
      </div>

      <RepositoryAnalysisSubmitButton
        isDisabled={controller.submit.isSubmitDisabled}
        isSubmitting={controller.submit.isSubmitting}
      />
    </form>
  );
};
