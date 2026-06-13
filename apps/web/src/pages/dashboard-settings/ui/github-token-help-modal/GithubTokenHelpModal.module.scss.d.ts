export type Styles = {
  content: string;
  externalLink: string;
  permissionList: string;
  section: string;
  sectionTitle: string;
  steps: string;
  text: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
