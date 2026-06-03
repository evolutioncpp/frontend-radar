export type Styles = {
  actions: string;
  dashboardHeader: string;
  link: string;
  logo: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
