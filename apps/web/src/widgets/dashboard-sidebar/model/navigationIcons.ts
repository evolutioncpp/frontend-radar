import {
  Activity,
  BarChart3,
  GitBranch,
  History,
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
  healthScore: Activity,
  metrics: BarChart3,
  checks: ListChecks,
  recommendations: Lightbulb,
};
