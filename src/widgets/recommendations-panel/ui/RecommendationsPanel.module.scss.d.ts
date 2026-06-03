export type Styles = {
  content: string;
  counter: string;
  description: string;
  emptyState: string;
  header: string;
  item: string;
  label: string;
  list: string;
  recommendationsPanel: string;
  recommendationTitle: string;
  severity: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
