export type Styles = {
  counter: string;
  header: string;
  label: string;
  labelRow: string;
  list: string;
  metricDescription: string;
  metricMain: string;
  metricMeta: string;
  metricProgress: string;
  metricRow: string;
  metricScore: string;
  metricScoreMax: string;
  metricScoreSeparator: string;
  metricScoreValue: string;
  metricsGrid: string;
  metricStatus: string;
  metricTitle: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
