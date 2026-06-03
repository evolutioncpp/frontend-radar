export type Styles = {
  aside: string;
  label: string;
  labelRow: string;
  main: string;
  sectionHeader: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
