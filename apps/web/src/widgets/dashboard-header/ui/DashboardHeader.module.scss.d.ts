export type Styles = {
  actions: string;
  dashboardHeader: string;
  icon: string;
  link: string;
  logo: string;
  mobileSidebarToggle: string;
  sidebarToggle: string;
  start: string;
  toggleIcon: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
