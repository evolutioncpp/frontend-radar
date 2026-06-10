export type Styles = {
  content: string;
  description: string;
  item: string;
  label: string;
  list: string;
  reportEvidenceList: string;
  source: string;
  status: string;
  summary: string;
  summaryIcon: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
