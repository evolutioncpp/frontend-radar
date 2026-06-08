export type Styles = {
  actionIcon: string;
  actions: string;
  body: string;
  content: string;
  description: string;
  details: string;
  detailsContent: string;
  detailsSummary: string;
  eyebrow: string;
  hero: string;
  heroText: string;
  icon: string;
  iconWrapper: string;
  primaryAction: string;
  routeErrorPage: string;
  secondaryAction: string;
  statusCode: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
