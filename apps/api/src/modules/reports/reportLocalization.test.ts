import { describe, expect, it } from 'vitest';

import { localizeProjectReport } from './reportLocalization.js';

import type { ProjectReport } from './reportSchemas.js';

const emptyTooling: ProjectReport['tooling'] = {
  accessibility: [],
  bundlers: [],
  formatting: [],
  frameworks: [],
  linting: [],
  packageManager: [],
  testing: [],
  typing: [],
  uiReview: [],
};

const createReport = (recommendations: ProjectReport['recommendations']): ProjectReport => ({
  analysisSources: [],
  checks: [],
  createdAt: '2026-06-09T00:00:00.000Z',
  id: 'report-id',
  recommendations,
  repository: {
    defaultBranch: 'main',
    description: null,
    forks: 0,
    latestCommitDate: null,
    latestCommitSha: null,
    latestCommitTitle: null,
    license: null,
    name: 'repo',
    owner: 'owner',
    projectPath: null,
    projectDetection: {
      source: 'autodetect',
      path: null,
      packageJsonPath: 'package.json',
      confidence: 'high',
      signals: [
        {
          id: 'project-package-json',
          label: 'Frontend package.json',
          status: 'found',
          source: 'package.json',
        },
      ],
    },
    stars: 0,
    url: 'https://github.com/owner/repo',
  },
  scoreBreakdown: [],
  tooling: emptyTooling,
  totalScore: 0,
});

describe('localizeProjectReport', () => {
  it('localizes new recommendation ids', () => {
    const localizedReport = localizeProjectReport(
      createReport([
        {
          description:
            'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
          id: 'add-a11y-tooling',
          severity: 'medium',
          title: 'Add accessibility checks',
        },
      ]),
      'ru',
    );

    expect(localizedReport.recommendations[0]).toMatchObject({
      description:
        'Добавьте eslint-plugin-jsx-a11y, axe-core или похожий инструмент, чтобы раньше находить регрессии доступности.',
      title: 'Добавить проверки доступности',
    });
  });

  it('localizes analysis source labels and missing tooling labels', () => {
    const report = createReport([]);
    report.analysisSources = [
      {
        description: 'Selected frontend package metadata was read.',
        id: 'project-package-json',
        kind: 'package_json',
        label: 'Selected package.json',
        scope: 'project',
        source: 'package.json',
        status: 'found',
      },
    ];
    report.tooling = {
      ...emptyTooling,
      frameworks: [
        {
          id: 'frameworks-missing',
          label: 'Not detected',
          sources: [],
          status: 'missing',
        },
      ],
    };

    const localizedReport = localizeProjectReport(report, 'ru');

    expect(localizedReport.analysisSources[0]?.label).not.toBe('Selected package.json');
    expect(localizedReport.analysisSources[0]?.description).not.toBe(
      'Selected frontend package metadata was read.',
    );
    expect(localizedReport.tooling.frameworks[0]?.label).not.toBe('Not detected');
  });
});
