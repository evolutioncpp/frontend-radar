export type Styles = {
  dashboardSidebar: string;
  dashboardSidebarCollapsed: string;
  dashboardSidebarMobileOpen: string;
  navigation: string;
  navigationIcon: string;
  navigationLink: string;
  navigationLinkActive: string;
  navigationText: string;
  sectionNavigation: string;
  sectionNavigationIcon: string;
  sectionNavigationLink: string;
  sectionNavigationLinks: string;
  sectionNavigationText: string;
  sectionNavigationTitle: string;
  sidebarBody: string;
  sidebarFooter: string;
  sidebarTooltip: string;
  sidebarTooltipCollapsed: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
