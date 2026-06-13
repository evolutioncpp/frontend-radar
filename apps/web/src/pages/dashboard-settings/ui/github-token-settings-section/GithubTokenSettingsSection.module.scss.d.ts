export type Styles = {
  actions: string;
  form: string;
  helpButton: string;
  section: string;
  sectionDescription: string;
  sectionHeader: string;
  sectionHeaderMain: string;
  sectionIcon: string;
  sectionTitle: string;
  tokenStatus: string;
  tokenStatusDescription: string;
  tokenStatusIcon: string;
  tokenStatusTitle: string;
  validationError: string;
  validationSuccess: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
