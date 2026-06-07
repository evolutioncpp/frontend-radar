export type Styles = {
  clearButton: string;
  clearIcon: string;
  control: string;
  controlInvalid: string;
  controlWithLeftIcon: string;
  controlWithRightAction: string;
  error: string;
  hint: string;
  icon: string;
  input: string;
  label: string;
  leftIcon: string;
  rightIcon: string;
  textInput: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
