export type Styles = {
  control: string;
  controlInvalid: string;
  controlOpen: string;
  dropdown: string;
  error: string;
  hint: string;
  icon: string;
  iconOpen: string;
  label: string;
  nativeInput: string;
  option: string;
  optionActive: string;
  optionDisabled: string;
  optionIcon: string;
  optionLabel: string;
  optionSelected: string;
  optionsList: string;
  placeholder: string;
  search: string;
  searchIcon: string;
  searchInput: string;
  selectField: string;
  trigger: string;
  value: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
