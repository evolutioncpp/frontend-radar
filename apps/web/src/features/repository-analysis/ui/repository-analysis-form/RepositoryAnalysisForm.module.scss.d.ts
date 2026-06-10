export type Styles = {
  fields: string;
  input: string;
  projectPathInput: string;
  projectPathToggle: string;
  repositoryAnalysisForm: string;
  submitButton: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
