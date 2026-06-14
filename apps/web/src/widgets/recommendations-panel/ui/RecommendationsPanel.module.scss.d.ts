export type Styles = {
  action: string;
  badges: string;
  category: string;
  content: string;
  counter: string;
  description: string;
  emptyState: string;
  group: string;
  groups: string;
  groupTitle: string;
  item: string;
  list: string;
  meta: string;
  recommendationsPanel: string;
  recommendationTitle: string;
  source: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
