export type Styles = {
  checkbox: string;
  content: string;
  hint: string;
  icon: string;
  input: string;
  label: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
