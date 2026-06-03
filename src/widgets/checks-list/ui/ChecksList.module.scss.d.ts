export type Styles = {
  checkLabel: string;
  checksList: string;
  content: string;
  counter: string;
  description: string;
  item: string;
  list: string;
  status: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
