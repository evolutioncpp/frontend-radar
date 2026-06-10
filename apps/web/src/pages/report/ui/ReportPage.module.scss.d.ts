export type Styles = {
  content: string;
  detailsCard: string;
  detailsGrid: string;
  detailsSection: string;
  fallbackCard: string;
  fallbackDescription: string;
  fallbackTitle: string;
  refreshButton: string;
  refreshIcon: string;
  reportPage: string;
  reuseNotice: string;
  reuseNoticeDescription: string;
  reuseNoticeTitle: string;
  section: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
