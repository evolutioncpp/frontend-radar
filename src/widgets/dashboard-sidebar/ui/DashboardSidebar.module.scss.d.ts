export type Styles = {
  dashboardSidebar: string;
  navigation: string;
  navigationLink: string;
  navigationLinkActive: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
