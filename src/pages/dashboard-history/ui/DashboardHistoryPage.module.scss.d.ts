export type Styles = {
  cardAside: string;
  cardDateCompact: string;
  cardLabel: string;
  cardLink: string;
  cardMain: string;
  cardTop: string;
  dashboardHistoryPage: string;
  description: string;
  emptyCard: string;
  emptyDescription: string;
  emptyTitle: string;
  header: string;
  historyCard: string;
  meta: string;
  repository: string;
  repositoryName: string;
  score: string;
  scoreLabel: string;
  scoreMax: string;
  scoreValue: string;
  scoreValueWrapper: string;
  summaryItem: string;
  summaryLabel: string;
  summaryList: string;
  summaryValue: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
