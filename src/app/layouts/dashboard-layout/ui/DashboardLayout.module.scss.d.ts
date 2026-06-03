export type Styles = {
  content: string;
  dashboardLayout: string;
  workspace: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
