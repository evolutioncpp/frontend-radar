export type Styles = {
  spin: string;
  spinner: string;
  spinner_lg: string;
  spinner_md: string;
  spinner_sm: string;
  spinnerLabel: string;
  spinnerRoot: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
