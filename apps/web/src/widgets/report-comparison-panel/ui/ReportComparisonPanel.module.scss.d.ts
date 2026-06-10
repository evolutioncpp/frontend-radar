export type Styles = {
  badgePair: string;
  checkItem: string;
  checkList: string;
  comparisonPanel: string;
  delta: string;
  deltaNegative: string;
  deltaNeutral: string;
  deltaPositive: string;
  description: string;
  emptyState: string;
  itemMain: string;
  itemTitle: string;
  metricItem: string;
  metricList: string;
  metricMeta: string;
  recommendationItem: string;
  recommendationList: string;
  recommendationStats: string;
  recommendationTitle: string;
  section: string;
  sections: string;
  sectionTitle: string;
  totalDelta: string;
  totalScore: string;
  totalScoreLabel: string;
  valueArrow: string;
  valuePair: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
