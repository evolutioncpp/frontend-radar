export type Styles = {
  badgePair: string;
  changeGroup: string;
  changeGroupHeader: string;
  changeGroups: string;
  changeItem: string;
  changeList: string;
  comparisonPanel: string;
  contextMeta: string;
  contextMetaIcon: string;
  delta: string;
  deltaNegative: string;
  deltaNeutral: string;
  deltaPositive: string;
  description: string;
  emptyState: string;
  groupCount: string;
  itemMain: string;
  itemMeta: string;
  itemTitle: string;
  noChanges: string;
  recommendationTitle: string;
  sectionTitle: string;
  summaryGrid: string;
  summaryHint: string;
  summaryItem: string;
  summaryLabel: string;
  summaryMeta: string;
  summaryMetaList: string;
  toneMixed: string;
  toneNegative: string;
  toneNeutral: string;
  tonePositive: string;
  unavailableCopy: string;
  unavailableDescription: string;
  unavailableIcon: string;
  unavailableMessage: string;
  unavailableReason: string;
  valueArrow: string;
  valuePair: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
