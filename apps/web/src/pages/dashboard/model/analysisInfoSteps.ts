export const analysisInfoSteps = [
  {
    titleKey: 'page.analysisInfo.steps.repository.title',
    descriptionKey: 'page.analysisInfo.steps.repository.description',
    detailTitleKey: 'page.analysisInfo.steps.repository.detailsTitle',
    detailItemKeys: [
      'page.analysisInfo.steps.repository.details.package',
      'page.analysisInfo.steps.repository.details.path',
      'page.analysisInfo.steps.repository.details.readme',
      'page.analysisInfo.steps.repository.details.branch',
    ],
  },
  {
    titleKey: 'page.analysisInfo.steps.signals.title',
    descriptionKey: 'page.analysisInfo.steps.signals.description',
    detailTitleKey: 'page.analysisInfo.steps.signals.detailsTitle',
    detailItemKeys: [
      'page.analysisInfo.steps.signals.details.source',
      'page.analysisInfo.steps.signals.details.typescript',
      'page.analysisInfo.steps.signals.details.tests',
      'page.analysisInfo.steps.signals.details.codeHealth',
    ],
  },
  {
    titleKey: 'page.analysisInfo.steps.metrics.title',
    descriptionKey: 'page.analysisInfo.steps.metrics.description',
    detailTitleKey: 'page.analysisInfo.steps.metrics.detailsTitle',
    detailItemKeys: [
      'page.analysisInfo.steps.metrics.details.dependencies',
      'page.analysisInfo.steps.metrics.details.ci',
      'page.analysisInfo.steps.metrics.details.security',
      'page.analysisInfo.steps.metrics.details.settings',
    ],
  },
  {
    titleKey: 'page.analysisInfo.steps.recommendations.title',
    descriptionKey: 'page.analysisInfo.steps.recommendations.description',
    detailTitleKey: 'page.analysisInfo.steps.recommendations.detailsTitle',
    detailItemKeys: [
      'page.analysisInfo.steps.recommendations.details.score',
      'page.analysisInfo.steps.recommendations.details.reasons',
      'page.analysisInfo.steps.recommendations.details.actions',
      'page.analysisInfo.steps.recommendations.details.history',
    ],
  },
] as const;
