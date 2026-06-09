import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProjectReport } from './types';
import type { TFunction } from 'i18next';

type DemoReportT = TFunction<'demo-report'>;

const createDemoReport = (t: DemoReportT): ProjectReport => ({
  id: 'demo-report',
  createdAt: '2026-06-02T00:00:00.000Z',
  totalScore: 82,
  repository: {
    owner: 'evolutioncpp',
    name: 'frontend-radar',
    url: 'https://github.com/evolutioncpp/frontend-radar',
    description: t('repository.description'),
    stars: 128,
    forks: 14,
    defaultBranch: 'main',
    latestCommitSha: 'demo-commit-sha',
    latestCommitDate: '2026-06-02T00:00:00.000Z',
    license: 'MIT',
  },
  scoreBreakdown: [
    {
      category: 'documentation',
      label: t('metrics.documentation.label'),
      value: 88,
      maxValue: 100,
      status: 'good',
      description: t('metrics.documentation.description'),
    },
    {
      category: 'testing',
      label: t('metrics.testing.label'),
      value: 76,
      maxValue: 100,
      status: 'good',
      description: t('metrics.testing.description'),
    },
    {
      category: 'ci',
      label: t('metrics.ci.label'),
      value: 92,
      maxValue: 100,
      status: 'excellent',
      description: t('metrics.ci.description'),
    },
    {
      category: 'dependencies',
      label: t('metrics.dependencies.label'),
      value: 71,
      maxValue: 100,
      status: 'warning',
      description: t('metrics.dependencies.description'),
    },
    {
      category: 'maintainability',
      label: t('metrics.maintainability.label'),
      value: 84,
      maxValue: 100,
      status: 'good',
      description: t('metrics.maintainability.description'),
    },
    {
      category: 'performance',
      label: t('metrics.performance.label'),
      value: 79,
      maxValue: 100,
      status: 'good',
      description: t('metrics.performance.description'),
    },
    {
      category: 'accessibility',
      label: t('metrics.accessibility.label'),
      value: 65,
      maxValue: 100,
      status: 'warning',
      description: t('metrics.accessibility.description'),
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      label: t('checks.readmeExists.label'),
      status: 'passed',
    },
    {
      id: 'package-json-exists',
      label: t('checks.packageJsonExists.label'),
      status: 'passed',
    },
    {
      id: 'typescript-detected',
      label: t('checks.typescriptDetected.label'),
      status: 'passed',
    },
    {
      id: 'lint-script-exists',
      label: t('checks.lintScriptExists.label'),
      status: 'passed',
    },
    {
      id: 'test-script-exists',
      label: t('checks.testScriptExists.label'),
      status: 'passed',
    },
    {
      id: 'storybook-missing',
      label: t('checks.storybookMissing.label'),
      status: 'warning',
      description: t('checks.storybookMissing.description'),
    },
    {
      id: 'env-example-missing',
      label: t('checks.envExampleMissing.label'),
      status: 'failed',
      description: t('checks.envExampleMissing.description'),
    },
  ],
  recommendations: [
    {
      id: 'add-github-actions',
      severity: 'high',
      title: t('recommendations.addGithubActions.title'),
      description: t('recommendations.addGithubActions.description'),
    },
    {
      id: 'add-storybook',
      severity: 'medium',
      title: t('recommendations.addStorybook.title'),
      description: t('recommendations.addStorybook.description'),
    },
    {
      id: 'add-env-example',
      severity: 'low',
      title: t('recommendations.addEnvExample.title'),
      description: t('recommendations.addEnvExample.description'),
    },
  ],
});

export const useDemoReport = () => {
  const { t } = useTranslation('demo-report');

  return useMemo(() => createDemoReport(t), [t]);
};
