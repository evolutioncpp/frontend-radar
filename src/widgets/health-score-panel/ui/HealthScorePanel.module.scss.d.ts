export type Styles = {
  description: string;
  header: string;
  heading: string;
  healthScorePanel: string;
  label: string;
  progress: string;
  score: string;
  scoreBlock: string;
  scoreMax: string;
  scoreValue: string;
  status: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
