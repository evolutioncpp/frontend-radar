import { describe, expect, it } from 'vitest';

import { localizeProjectReport } from './reportLocalization.js';

import type { ProjectReport } from './reportSchemas.js';

const createReport = (recommendations: ProjectReport['recommendations']): ProjectReport => ({
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
});
