export type Styles = {
  content: string;
  dashboardLayout: string;
  dashboardLayoutCollapsed: string;
  mobileSidebarOverlay: string;
  mobileSidebarOverlayVisible: string;
  workspace: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
