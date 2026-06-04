export type Styles = {
  dropdown: string;
  icon: string;
  languageSwitcher: string;
  languageSwitcherCollapsed: string;
  languageSwitcherSidebar: string;
  option: string;
  optionIcon: string;
  options: string;
  optionSelected: string;
  screenReaderText: string;
  text: string;
  trigger: string;
  triggerCollapsed: string;
  triggerIcon: string;
  triggerSidebar: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
