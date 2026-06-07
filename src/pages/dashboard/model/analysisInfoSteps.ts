export const analysisInfoSteps = [
  {
    titleKey: 'page.analysisInfo.steps.repository.title',
    descriptionKey: 'page.analysisInfo.steps.repository.description',
    detailTitleKey: 'page.analysisInfo.steps.repository.detailsTitle',
    detailItemKeys: [
      'page.analysisInfo.steps.repository.details.package',
      'page.analysisInfo.steps.repository.details.readme',
      'page.analysisInfo.steps.repository.details.license',
      'page.analysisInfo.steps.repository.details.branch',
    ],
  },
  {
    titleKey: 'page.analysisInfo.steps.signals.title',
    descriptionKey: 'page.analysisInfo.steps.signals.description',
    detailTitleKey: 'page.analysisInfo.steps.signals.detailsTitle',
    detailItemKeys: [
      'page.analysisInfo.steps.signals.details.scripts',
      'page.analysisInfo.steps.signals.details.typescript',
      'page.analysisInfo.steps.signals.details.quality',
      'page.analysisInfo.steps.signals.details.delivery',
    ],
  },
  {
    titleKey: 'page.analysisInfo.steps.metrics.title',
    descriptionKey: 'page.analysisInfo.steps.metrics.description',
    detailTitleKey: 'page.analysisInfo.steps.metrics.detailsTitle',
    detailItemKeys: [
      'page.analysisInfo.steps.metrics.details.score',
      'page.analysisInfo.steps.metrics.details.metrics',
      'page.analysisInfo.steps.metrics.details.checks',
      'page.analysisInfo.steps.metrics.details.statuses',
    ],
  },
  {
    titleKey: 'page.analysisInfo.steps.recommendations.title',
    descriptionKey: 'page.analysisInfo.steps.recommendations.description',
    detailTitleKey: 'page.analysisInfo.steps.recommendations.detailsTitle',
    detailItemKeys: [
      'page.analysisInfo.steps.recommendations.details.high',
      'page.analysisInfo.steps.recommendations.details.medium',
      'page.analysisInfo.steps.recommendations.details.low',
      'page.analysisInfo.steps.recommendations.details.impact',
    ],
  },
] as const;
