export type Styles = {
  content: string;
  dashboardPage: string;
  description: string;
  detailsGrid: string;
  header: string;
  label: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
