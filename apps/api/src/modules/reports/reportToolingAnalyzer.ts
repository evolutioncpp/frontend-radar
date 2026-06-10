import type { ProjectReport } from './reportSchemas.js';
import type { RepositorySignals, ToolSignal } from './reportSignals.js';

type ReportTooling = ProjectReport['tooling'];
type ToolingGroup = keyof ReportTooling;
type ToolingItem = ReportTooling[ToolingGroup][number];

const missingItem = (group: ToolingGroup): ToolingItem => ({
  id: `${group}-missing`,
  label: 'Not detected',
  status: 'missing',
  sources: [],
});

const getSignalStatus = (signal: ToolSignal): ToolingItem['status'] => {
  if (!signal.found) {
    return 'missing';
  }

  return (signal.projectSources?.length ?? 0) > 0 ? 'found' : 'warning';
};

const createSignalItem = ({
  fallbackLabel,
  group,
  signal,
}: {
  fallbackLabel: string;
  group: ToolingGroup;
  signal: ToolSignal;
}): ToolingItem[] => {
  if (!signal.found) {
    return [missingItem(group)];
  }

  return [
    {
      id: signal.dependencies[0] ?? group,
      label: signal.dependencies.length > 0 ? signal.dependencies.join(', ') : fallbackLabel,
      status: getSignalStatus(signal),
      sources: signal.sources,
    },
  ];
};

export const buildReportTooling = (signals: RepositorySignals): ReportTooling => ({
  accessibility: createSignalItem({
    fallbackLabel: 'Accessibility tooling',
    group: 'accessibility',
    signal: signals.a11yTooling,
  }),
  bundlers: createSignalItem({
    fallbackLabel: 'Frontend bundler',
    group: 'bundlers',
    signal: signals.bundler,
  }),
  formatting: createSignalItem({
    fallbackLabel: 'Formatter',
    group: 'formatting',
    signal: signals.formatting,
  }),
  frameworks: createSignalItem({
    fallbackLabel: 'Frontend framework',
    group: 'frameworks',
    signal: signals.frameworks,
  }),
  linting: createSignalItem({
    fallbackLabel: 'Linting',
    group: 'linting',
    signal: signals.linting,
  }),
  packageManager: [
    signals.lockfile.packageManager
      ? {
          id: signals.lockfile.packageManager,
          label: signals.lockfile.packageManager,
          status: 'found',
          sources: signals.lockfile.path ? [signals.lockfile.path] : [],
        }
      : missingItem('packageManager'),
  ],
  testing: createSignalItem({
    fallbackLabel: 'Testing',
    group: 'testing',
    signal: signals.testingLibrary,
  }),
  typing: createSignalItem({
    fallbackLabel: 'TypeScript',
    group: 'typing',
    signal: signals.typescript,
  }),
  uiReview: createSignalItem({
    fallbackLabel: 'Storybook',
    group: 'uiReview',
    signal: signals.storybook,
  }),
});
