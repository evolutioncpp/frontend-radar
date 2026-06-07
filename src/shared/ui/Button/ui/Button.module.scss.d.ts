export type Styles = {
  button: string;
  button_ghost: string;
  button_primary: string;
  button_secondary: string;
  buttonFullWidth: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
