export type Styles = {
  content: string;
  counter: string;
  description: string;
  emptyState: string;
  item: string;
  list: string;
  recommendationsPanel: string;
  recommendationTitle: string;
  severity: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
