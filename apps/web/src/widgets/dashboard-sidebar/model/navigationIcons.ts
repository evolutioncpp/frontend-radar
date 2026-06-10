import {
  Activity,
  BarChart3,
  GitCompareArrows,
  GitBranch,
  History,
  FileSearch,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Settings,
  type LucideIcon,
} from 'lucide-react';

import type { DashboardNavigationIcon } from './navigation';

export const navigationIcons: Record<DashboardNavigationIcon, LucideIcon> = {
  overview: LayoutDashboard,
  history: History,
  settings: Settings,
  repository: GitBranch,
  analysisDetails: FileSearch,
  healthScore: Activity,
  comparison: GitCompareArrows,
  metrics: BarChart3,
  checks: ListChecks,
  recommendations: Lightbulb,
};
