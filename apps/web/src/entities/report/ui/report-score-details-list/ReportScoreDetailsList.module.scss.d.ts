export type Styles = {
  cap: string;
  content: string;
  description: string;
  item: string;
  itemContent: string;
  itemHeader: string;
  label: string;
  list: string;
  metaGrid: string;
  metaLabel: string;
  metaValue: string;
  points: string;
  reportScoreDetailsList: string;
  source: string;
  status: string;
  summary: string;
  summaryIcon: string;
  tags: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
