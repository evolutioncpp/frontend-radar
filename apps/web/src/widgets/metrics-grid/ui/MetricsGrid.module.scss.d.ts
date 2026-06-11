export type Styles = {
  counter: string;
  list: string;
  metricDescription: string;
  metricMain: string;
  metricMeta: string;
  metricProgress: string;
  metricRow: string;
  metricScore: string;
  metricScoreDetails: string;
  metricScoreMax: string;
  metricScoreSeparator: string;
  metricScoreValue: string;
  metricsGrid: string;
  metricStatus: string;
  metricTitle: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
