export type Styles = {
  description: string;
  healthScorePanel: string;
  progress: string;
  score: string;
  scoreBlock: string;
  scoreMax: string;
  scoreValue: string;
  scoreValueCritical: string;
  scoreValueExcellent: string;
  scoreValueGood: string;
  scoreValueWarning: string;
  status: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
