import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  getCheckStatusBadgeVariant,
  getRecommendationSeverityBadgeVariant,
  getScoreStatusBadgeVariant,
} from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './ReportComparisonPanel.module.scss';

import type { GetReportComparisonApiResponse } from '@/entities/report';
import type { ReactNode } from 'react';

type ReportComparison = Extract<
  GetReportComparisonApiResponse,
  {
    status: 'available';
  }
>;

interface ReportComparisonPanelProps {
  comparison: ReportComparison;
  headerAction?: ReactNode;
}

const scoreStatusLabelKeys = {
  excellent: 'statuses.excellent',
  good: 'statuses.good',
  warning: 'statuses.warning',
  critical: 'statuses.critical',
} as const satisfies Record<ReportComparison['metrics'][number]['currentStatus'], string>;

const checkStatusLabelKeys = {
  passed: 'statuses.passed',
  failed: 'statuses.failed',
  warning: 'statuses.warning',
} as const satisfies Record<ReportComparison['checks'][number]['currentStatus'], string>;

const recommendationSeverityLabelKeys = {
  high: 'statuses.high',
  medium: 'statuses.medium',
  low: 'statuses.low',
} as const satisfies Record<
  ReportComparison['recommendations']['added'][number]['severity'],
  string
>;

const formatDelta = (delta: number) => {
  if (delta > 0) {
    return `+${delta}`;
  }

  return `${delta}`;
};

const getDeltaClassName = (delta: number) => {
  if (delta > 0) {
    return s.deltaPositive;
  }

  if (delta < 0) {
    return s.deltaNegative;
  }

  return s.deltaNeutral;
};

export const ReportComparisonPanel = ({ comparison, headerAction }: ReportComparisonPanelProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <Card aria-label={t('comparison.label')} className={s.comparisonPanel}>
      <SectionHeader
        action={headerAction}
        aside={
          <span
            aria-label={t('comparison.totalScoreDeltaAria', {
              delta: formatDelta(comparison.totalScore.delta),
            })}
            className={clsx(s.totalDelta, getDeltaClassName(comparison.totalScore.delta))}
          >
            {formatDelta(comparison.totalScore.delta)}
          </span>
        }
        label={t('comparison.label')}
        title={t('comparison.title')}
      />

      <p className={s.description}>{t('comparison.description')}</p>

      <div className={s.totalScore}>
        <span className={s.totalScoreLabel}>{t('comparison.totalScore')}</span>
        <span className={s.valuePair}>
          <span>{comparison.totalScore.previous}</span>
          <ArrowRight aria-hidden="true" className={s.valueArrow} strokeWidth={2} />
          <strong>{comparison.totalScore.current}</strong>
        </span>
      </div>

      <div className={s.sections}>
        <section className={s.section}>
          <h3 className={s.sectionTitle}>{t('comparison.metricsTitle')}</h3>

          <ul className={s.metricList}>
            {comparison.metrics.map((metric) => (
              <li className={s.metricItem} key={metric.category}>
                <div className={s.itemMain}>
                  <p className={s.itemTitle}>{metric.label}</p>
                  <span className={s.valuePair}>
                    <span>{metric.previousValue}</span>
                    <ArrowRight aria-hidden="true" className={s.valueArrow} strokeWidth={2} />
                    <strong>{metric.currentValue}</strong>
                  </span>
                </div>

                <div className={s.metricMeta}>
                  <span className={clsx(s.delta, getDeltaClassName(metric.delta))}>
                    {formatDelta(metric.delta)}
                  </span>
                  <Badge variant={getScoreStatusBadgeVariant(metric.currentStatus)}>
                    {t(scoreStatusLabelKeys[metric.currentStatus])}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section}>
          <h3 className={s.sectionTitle}>{t('comparison.changedChecksTitle')}</h3>

          {comparison.checks.length > 0 ? (
            <ul className={s.checkList}>
              {comparison.checks.map((check) => (
                <li className={s.checkItem} key={check.id}>
                  <p className={s.itemTitle}>{check.label}</p>
                  <span className={s.badgePair}>
                    <Badge variant={getCheckStatusBadgeVariant(check.previousStatus)}>
                      {t(checkStatusLabelKeys[check.previousStatus])}
                    </Badge>
                    <ArrowRight aria-hidden="true" className={s.valueArrow} strokeWidth={2} />
                    <Badge variant={getCheckStatusBadgeVariant(check.currentStatus)}>
                      {t(checkStatusLabelKeys[check.currentStatus])}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={s.emptyState}>{t('comparison.noChangedChecks')}</p>
          )}
        </section>

        <section className={s.section}>
          <h3 className={s.sectionTitle}>{t('comparison.recommendationsTitle')}</h3>

          <div className={s.recommendationStats}>
            <span>
              {t('comparison.addedRecommendations', {
                count: comparison.recommendations.added.length,
              })}
            </span>
            <span>
              {t('comparison.resolvedRecommendations', {
                count: comparison.recommendations.resolved.length,
              })}
            </span>
            <span>
              {t('comparison.persistentRecommendations', {
                count: comparison.recommendations.persistentCount,
              })}
            </span>
          </div>

          {comparison.recommendations.added.length > 0 ||
          comparison.recommendations.resolved.length > 0 ? (
            <ul className={s.recommendationList}>
              {comparison.recommendations.added.map((recommendation) => (
                <li className={s.recommendationItem} key={`added-${recommendation.id}`}>
                  <Badge variant={getRecommendationSeverityBadgeVariant(recommendation.severity)}>
                    {t(recommendationSeverityLabelKeys[recommendation.severity])}
                  </Badge>
                  <span className={s.recommendationTitle}>{recommendation.title}</span>
                </li>
              ))}
              {comparison.recommendations.resolved.map((recommendation) => (
                <li className={s.recommendationItem} key={`resolved-${recommendation.id}`}>
                  <Badge variant="success">{t('comparison.resolvedBadge')}</Badge>
                  <span className={s.recommendationTitle}>{recommendation.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={s.emptyState}>{t('comparison.emptyRecommendations')}</p>
          )}
        </section>
      </div>
    </Card>
  );
};
