export type Styles = {
  content: string;
  dashboardPage: string;
  description: string;
  detailsCard: string;
  detailsGrid: string;
  detailsSection: string;
  header: string;
  label: string;
  section: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
