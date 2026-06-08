export type Styles = {
  content: string;
  dropdown: string;
  trigger: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
