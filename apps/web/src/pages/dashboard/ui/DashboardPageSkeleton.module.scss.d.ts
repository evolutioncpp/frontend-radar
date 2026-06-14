export type Styles = {
  analysisInfoDescriptionLine: string;
  analysisInfoDescriptionLines: string;
  analysisInfoTitleLine: string;
  checkboxPreview: string;
  detailLineBox: string;
  fieldsPreview: string;
  formPreview: string;
  hintPreviewLine: string;
  inputControlPreview: string;
  inputIconPreview: string;
  inputPreview: string;
  labelPreviewLine: string;
  repositoryDescriptionLine: string;
  repositoryDescriptionLines: string;
  repositoryHeader: string;
  repositoryPanel: string;
  repositoryTitleLine: string;
  status: string;
  stepDescriptionLines: string;
  stepDetailsTitleLineBox: string;
  stepNumberLine: string;
  stepTitleLineBox: string;
  submitPreview: string;
  toggleHintPreviewLine: string;
  togglePreview: string;
  toggleTextPreview: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
