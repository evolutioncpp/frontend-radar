export type Styles = {
  checkLabel: string;
  checksList: string;
  content: string;
  counter: string;
  description: string;
  header: string;
  item: string;
  label: string;
  labelRow: string;
  list: string;
  status: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
