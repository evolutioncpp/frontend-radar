import {
  reportAnalysisSourceScopeLabelKeys,
  reportAnalysisSourceStatusLabelKeys,
  reportCheckStatusLabelKeys,
  reportRecommendationCategoryLabelKeys,
  reportRecommendationEffortLabelKeys,
  reportRecommendationImpactLabelKeys,
  reportRecommendationSeverityLabelKeys,
  reportScoreStatusLabelKeys,
  reportToolingGroupLabelKeys,
  reportToolingGroupOrder,
  type AnalysisSource,
  type ProjectReport,
  type ReportCheck,
  type ReportRecommendation,
  type ScoreBreakdownItem,
  type ToolingGroup,
  type ToolingItem,
} from '@/entities/report';
import { formatDateTime } from '@/shared/lib/format-date';
import { formatScore } from '@/shared/lib/format-score';

export type ReportExportTranslateOptions = Record<string, number | string>;

export type ReportExportTranslator = (
  key: string,
  options?: ReportExportTranslateOptions,
) => string;

export interface CreateReportMarkdownExportOptions {
  locale: string;
  t: ReportExportTranslator;
}

export interface ReportMarkdownExport {
  content: string;
  filename: string;
}

const markdownMimeType = 'text/markdown;charset=utf-8';

export const reportMarkdownMimeType = markdownMimeType;

const isPresent = (value: string | null | undefined): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const escapeMarkdownInline = (value: number | string) => {
  return String(value)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/([`*_{}[\]<>()#+!|])/g, '\\$1');
};

const formatDateValue = (value: string, locale: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatDateTime(date, locale);
};

const getIsoDatePart = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10) || 'unknown-date';
  }

  return date.toISOString().slice(0, 10);
};

const slugifyFilenamePart = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'unknown';
};

const createReportFilename = (report: ProjectReport) => {
  const repository = report.repository;
  const version = repository.latestCommitSha?.slice(0, 7) || report.id;
  const date = getIsoDatePart(report.createdAt);

  return (
    [
      'frontend-radar',
      slugifyFilenamePart(repository.owner),
      slugifyFilenamePart(repository.name),
      slugifyFilenamePart(version),
      slugifyFilenamePart(date),
    ].join('-') + '.md'
  );
};

const appendField = (lines: string[], label: string, value: number | string) => {
  lines.push(`- ${escapeMarkdownInline(label)}: ${escapeMarkdownInline(value)}`);
};

const appendOptionalField = (lines: string[], label: string, value: string | null | undefined) => {
  if (isPresent(value)) {
    appendField(lines, label, value);
  }
};

const appendMetric = (
  lines: string[],
  metric: ScoreBreakdownItem,
  { t }: CreateReportMarkdownExportOptions,
) => {
  lines.push(`### ${escapeMarkdownInline(metric.label)}`);
  appendField(
    lines,
    t('reportExport.fields.score'),
    formatScore(metric.value, {
      max: metric.maxValue,
    }),
  );
  appendField(lines, t('reportExport.fields.status'), t(reportScoreStatusLabelKeys[metric.status]));

  if (isPresent(metric.description)) {
    appendField(lines, t('reportExport.fields.description'), metric.description);
  }

  lines.push('');
};

const appendCheck = (
  lines: string[],
  check: ReportCheck,
  { t }: CreateReportMarkdownExportOptions,
) => {
  const status = t(reportCheckStatusLabelKeys[check.status]);

  lines.push(`- ${escapeMarkdownInline(status)}: ${escapeMarkdownInline(check.label)}`);

  if (isPresent(check.description)) {
    lines.push(
      `  - ${escapeMarkdownInline(t('reportExport.fields.description'))}: ${escapeMarkdownInline(check.description)}`,
    );
  }
};

const appendRecommendation = (
  lines: string[],
  recommendation: ReportRecommendation,
  { t }: CreateReportMarkdownExportOptions,
) => {
  lines.push(`### ${escapeMarkdownInline(recommendation.title)}`);
  appendField(
    lines,
    t('reportExport.fields.severity'),
    t(reportRecommendationSeverityLabelKeys[recommendation.severity]),
  );
  appendField(
    lines,
    t('reportExport.fields.impact'),
    t(reportRecommendationImpactLabelKeys[recommendation.impactLevel]),
  );
  appendField(
    lines,
    t('reportExport.fields.effort'),
    t(reportRecommendationEffortLabelKeys[recommendation.effort]),
  );
  appendField(
    lines,
    t('reportExport.fields.categories'),
    recommendation.categories
      .map((category) => t(reportRecommendationCategoryLabelKeys[category]))
      .join(', '),
  );
  appendField(lines, t('reportExport.fields.description'), recommendation.description);
  appendField(lines, t('reportExport.fields.action'), recommendation.action);
  appendOptionalField(lines, t('reportExport.fields.source'), recommendation.source);
  lines.push('');
};

interface ReportToolingItem {
  group: ToolingGroup;
  item: ToolingItem;
}

const getToolingItems = (report: ProjectReport): ReportToolingItem[] => {
  const items: ReportToolingItem[] = [];

  reportToolingGroupOrder.forEach((group) => {
    report.tooling[group].forEach((item) => {
      items.push({
        group,
        item,
      });
    });
  });

  return items;
};

const appendToolingItem = (
  lines: string[],
  group: ToolingGroup,
  item: ToolingItem,
  { t }: CreateReportMarkdownExportOptions,
) => {
  const groupLabel = t(reportToolingGroupLabelKeys[group]);
  const status = t(reportAnalysisSourceStatusLabelKeys[item.status]);
  const sources = item.sources
    .map((source) => source.detail || source.raw || source.label)
    .filter(isPresent)
    .join(', ');
  const sourceSuffix = sources ? ` (${escapeMarkdownInline(sources)})` : '';

  lines.push(
    `- ${escapeMarkdownInline(groupLabel)}: ${escapeMarkdownInline(item.label)} - ${escapeMarkdownInline(status)}${sourceSuffix}`,
  );
};

const appendAnalysisSource = (
  lines: string[],
  source: AnalysisSource,
  { t }: CreateReportMarkdownExportOptions,
) => {
  const status = t(reportAnalysisSourceStatusLabelKeys[source.status]);
  const scope = t(reportAnalysisSourceScopeLabelKeys[source.scope]);
  const details = [source.description, source.source].filter(isPresent).join(' ');
  const detailsSuffix = details ? ` - ${escapeMarkdownInline(details)}` : '';

  lines.push(
    `- ${escapeMarkdownInline(status)}: ${escapeMarkdownInline(source.label)} (${escapeMarkdownInline(scope)})${detailsSuffix}`,
  );
};

export const createReportMarkdownExport = (
  report: ProjectReport,
  options: CreateReportMarkdownExportOptions,
): ReportMarkdownExport => {
  const { locale, t } = options;
  const repository = report.repository;
  const repositoryFullName = `${repository.owner}/${repository.name}`;
  const lines: string[] = [];

  lines.push(
    `# ${escapeMarkdownInline(t('reportExport.title', { repository: repositoryFullName }))}`,
  );
  lines.push('');

  lines.push(`## ${escapeMarkdownInline(t('reportExport.sections.metadata'))}`);
  appendField(lines, t('reportExport.fields.repository'), repositoryFullName);
  appendField(lines, t('reportExport.fields.repositoryUrl'), repository.url);
  appendField(
    lines,
    t('repository.metadata.branch'),
    repository.branch || repository.defaultBranch,
  );
  appendOptionalField(lines, t('repository.metadata.projectPath'), repository.projectPath);
  appendField(
    lines,
    t('repository.metadata.license'),
    repository.license ?? t('repository.metadata.unknown'),
  );
  appendOptionalField(lines, t('reportExport.fields.commit'), repository.latestCommitSha);
  appendOptionalField(lines, t('reportExport.fields.commitTitle'), repository.latestCommitTitle);

  if (isPresent(repository.latestCommitDate)) {
    appendField(
      lines,
      t('reportExport.fields.commitDate'),
      formatDateValue(repository.latestCommitDate, locale),
    );
  }

  appendField(
    lines,
    t('reportExport.fields.reportDate'),
    formatDateValue(report.createdAt, locale),
  );
  lines.push('');

  lines.push(`## ${escapeMarkdownInline(t('reportExport.sections.summary'))}`);
  appendField(lines, t('reportExport.fields.totalScore'), formatScore(report.totalScore));
  lines.push('');

  lines.push(`## ${escapeMarkdownInline(t('reportExport.sections.metrics'))}`);
  report.scoreBreakdown.forEach((metric) => appendMetric(lines, metric, options));

  lines.push(`## ${escapeMarkdownInline(t('reportExport.sections.checks'))}`);
  if (report.checks.length > 0) {
    report.checks.forEach((check) => appendCheck(lines, check, options));
  } else {
    lines.push(`- ${escapeMarkdownInline(t('reportExport.emptyChecks'))}`);
  }
  lines.push('');

  lines.push(`## ${escapeMarkdownInline(t('reportExport.sections.recommendations'))}`);
  if (report.recommendations.length > 0) {
    report.recommendations.forEach((recommendation) =>
      appendRecommendation(lines, recommendation, options),
    );
  } else {
    lines.push(`- ${escapeMarkdownInline(t('recommendations.empty'))}`);
    lines.push('');
  }

  lines.push(`## ${escapeMarkdownInline(t('reportExport.sections.analysisSources'))}`);
  if (report.analysisSources.length > 0) {
    report.analysisSources.forEach((source) => appendAnalysisSource(lines, source, options));
  } else {
    lines.push(`- ${escapeMarkdownInline(t('reportExport.emptyAnalysisSources'))}`);
  }
  lines.push('');

  lines.push(`## ${escapeMarkdownInline(t('reportExport.sections.tooling'))}`);
  const toolingItems = getToolingItems(report);

  if (toolingItems.length > 0) {
    toolingItems.forEach(({ group, item }) => appendToolingItem(lines, group, item, options));
  } else {
    lines.push(`- ${escapeMarkdownInline(t('reportExport.emptyTooling'))}`);
  }

  return {
    content: lines.join('\n').trimEnd() + '\n',
    filename: createReportFilename(report),
  };
};
