export type Styles = {
  description: string;
  eyebrow: string;
  header: string;
  page: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
