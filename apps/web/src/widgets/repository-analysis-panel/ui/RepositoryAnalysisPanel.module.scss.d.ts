export type Styles = {
  description: string;
  header: string;
  label: string;
  repositoryAnalysisPanel: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
