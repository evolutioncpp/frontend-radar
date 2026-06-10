export const DashboardSectionIds = {
  REPOSITORY: 'repository',
  HEALTH_SCORE: 'health-score',
  COMPARISON: 'comparison',
  METRICS: 'metrics',
  CHECKS: 'checks',
  RECOMMENDATIONS: 'recommendations',
} as const;

export type DashboardSectionId = (typeof DashboardSectionIds)[keyof typeof DashboardSectionIds];

export type DashboardSectionNavigationIcon =
  | 'repository'
  | 'healthScore'
  | 'comparison'
  | 'metrics'
  | 'checks'
  | 'recommendations';

export const dashboardSectionPageLabelKeys = {
  [DashboardSectionIds.REPOSITORY]: 'page.sections.repository',
  [DashboardSectionIds.HEALTH_SCORE]: 'page.sections.healthScore',
  [DashboardSectionIds.COMPARISON]: 'page.sections.comparison',
  [DashboardSectionIds.METRICS]: 'page.sections.metrics',
  [DashboardSectionIds.CHECKS]: 'page.sections.checks',
  [DashboardSectionIds.RECOMMENDATIONS]: 'page.sections.recommendations',
} as const satisfies Record<DashboardSectionId, string>;

export const dashboardSectionSidebarLabelKeys = {
  repository: 'sidebar.items.repository',
  healthScore: 'sidebar.items.healthScore',
  comparison: 'sidebar.items.comparison',
  metrics: 'sidebar.items.metrics',
  checks: 'sidebar.items.checks',
  recommendations: 'sidebar.items.recommendations',
} as const satisfies Record<DashboardSectionNavigationIcon, string>;

interface DashboardSection {
  id: DashboardSectionId;
  href: `#${DashboardSectionId}`;
  pageLabelKey: (typeof dashboardSectionPageLabelKeys)[DashboardSectionId];
  sidebarLabelKey: (typeof dashboardSectionSidebarLabelKeys)[DashboardSectionNavigationIcon];
  navigationIcon: DashboardSectionNavigationIcon;
}

export const getDashboardSectionHref = (sectionId: DashboardSectionId) => {
  return `#${sectionId}` as const;
};

export const getDashboardSectionIdFromHash = (hash: string) => {
  return decodeURIComponent(hash.replace('#', ''));
};

export const dashboardSections = [
  {
    id: DashboardSectionIds.REPOSITORY,
    href: getDashboardSectionHref(DashboardSectionIds.REPOSITORY),
    pageLabelKey: dashboardSectionPageLabelKeys[DashboardSectionIds.REPOSITORY],
    sidebarLabelKey: dashboardSectionSidebarLabelKeys.repository,
    navigationIcon: 'repository',
  },
  {
    id: DashboardSectionIds.HEALTH_SCORE,
    href: getDashboardSectionHref(DashboardSectionIds.HEALTH_SCORE),
    pageLabelKey: dashboardSectionPageLabelKeys[DashboardSectionIds.HEALTH_SCORE],
    sidebarLabelKey: dashboardSectionSidebarLabelKeys.healthScore,
    navigationIcon: 'healthScore',
  },
  {
    id: DashboardSectionIds.COMPARISON,
    href: getDashboardSectionHref(DashboardSectionIds.COMPARISON),
    pageLabelKey: dashboardSectionPageLabelKeys[DashboardSectionIds.COMPARISON],
    sidebarLabelKey: dashboardSectionSidebarLabelKeys.comparison,
    navigationIcon: 'comparison',
  },
  {
    id: DashboardSectionIds.METRICS,
    href: getDashboardSectionHref(DashboardSectionIds.METRICS),
    pageLabelKey: dashboardSectionPageLabelKeys[DashboardSectionIds.METRICS],
    sidebarLabelKey: dashboardSectionSidebarLabelKeys.metrics,
    navigationIcon: 'metrics',
  },
  {
    id: DashboardSectionIds.CHECKS,
    href: getDashboardSectionHref(DashboardSectionIds.CHECKS),
    pageLabelKey: dashboardSectionPageLabelKeys[DashboardSectionIds.CHECKS],
    sidebarLabelKey: dashboardSectionSidebarLabelKeys.checks,
    navigationIcon: 'checks',
  },
  {
    id: DashboardSectionIds.RECOMMENDATIONS,
    href: getDashboardSectionHref(DashboardSectionIds.RECOMMENDATIONS),
    pageLabelKey: dashboardSectionPageLabelKeys[DashboardSectionIds.RECOMMENDATIONS],
    sidebarLabelKey: dashboardSectionSidebarLabelKeys.recommendations,
    navigationIcon: 'recommendations',
  },
] as const satisfies readonly DashboardSection[];

export const dashboardSectionIds = dashboardSections.map((section) => section.id);
