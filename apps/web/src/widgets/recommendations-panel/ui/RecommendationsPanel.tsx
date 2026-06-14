import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import {
  getRecommendationSeverityBadgeVariant,
  type ReportRecommendation,
} from '@/entities/report';
import { Badge, type BadgeVariant } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './RecommendationsPanel.module.scss';

import type { ReactNode } from 'react';

interface RecommendationsPanelProps {
  recommendations: ReportRecommendation[];
  className?: string;
  headerAction?: ReactNode;
}

const recommendationSeverityLabelKeys = {
  high: 'statuses.high',
  medium: 'statuses.medium',
  low: 'statuses.low',
} as const satisfies Record<ReportRecommendation['severity'], string>;

const recommendationImpactLabelKeys = {
  key: 'recommendations.impact.key',
  important: 'recommendations.impact.important',
  supporting: 'recommendations.impact.supporting',
} as const satisfies Record<ReportRecommendation['impactLevel'], string>;

const recommendationImpactBadgeVariants = {
  key: 'warning',
  important: 'info',
  supporting: 'default',
} as const satisfies Record<ReportRecommendation['impactLevel'], BadgeVariant>;

const recommendationEffortLabelKeys = {
  small: 'recommendations.effort.small',
  medium: 'recommendations.effort.medium',
  large: 'recommendations.effort.large',
} as const satisfies Record<ReportRecommendation['effort'], string>;

const recommendationCategoryLabelKeys = {
  accessibility: 'recommendations.categories.accessibility',
  ci: 'recommendations.categories.ci',
  dependencies: 'recommendations.categories.dependencies',
  documentation: 'recommendations.categories.documentation',
  maintainability: 'recommendations.categories.maintainability',
  performance: 'recommendations.categories.performance',
  security: 'recommendations.categories.security',
  testing: 'recommendations.categories.testing',
} as const satisfies Record<ReportRecommendation['categories'][number], string>;

const recommendationGroupLabelKeys = {
  first: 'recommendations.groups.first',
  next: 'recommendations.groups.next',
  later: 'recommendations.groups.later',
} as const;

type RecommendationGroup = keyof typeof recommendationGroupLabelKeys;

const recommendationGroupOrder: RecommendationGroup[] = ['first', 'next', 'later'];

const getRecommendationGroup = (recommendation: ReportRecommendation): RecommendationGroup => {
  if (recommendation.severity === 'high' || recommendation.impactLevel === 'key') {
    return 'first';
  }

  if (recommendation.impactLevel === 'important') {
    return 'next';
  }

  return 'later';
};

export const RecommendationsPanel = ({
  className,
  headerAction,
  recommendations,
}: RecommendationsPanelProps) => {
  const { t } = useTranslation('dashboard');
  const recommendationsByGroup = recommendationGroupOrder.map((group) => ({
    group,
    recommendations: recommendations.filter(
      (recommendation) => getRecommendationGroup(recommendation) === group,
    ),
  }));

  return (
    <Card className={clsx(s.recommendationsPanel, className)}>
      <SectionHeader
        action={headerAction}
        aside={
          <span className={s.counter}>
            {t('recommendations.counter', { count: recommendations.length })}
          </span>
        }
        label={t('recommendations.label')}
        title={t('recommendations.title')}
      />

      {recommendations.length > 0 ? (
        <div className={s.groups}>
          {recommendationsByGroup.map(({ group, recommendations: groupRecommendations }) =>
            groupRecommendations.length > 0 ? (
              <section className={s.group} key={group}>
                <h3 className={s.groupTitle}>{t(recommendationGroupLabelKeys[group])}</h3>
                <ul
                  aria-label={t('recommendations.groupListAria', {
                    group: t(recommendationGroupLabelKeys[group]),
                  })}
                  className={s.list}
                >
                  {groupRecommendations.map((recommendation) => (
                    <li className={s.item} key={recommendation.id}>
                      <div className={s.badges}>
                        <Badge
                          variant={getRecommendationSeverityBadgeVariant(recommendation.severity)}
                        >
                          {t(recommendationSeverityLabelKeys[recommendation.severity])}
                        </Badge>
                        <Badge
                          variant={recommendationImpactBadgeVariants[recommendation.impactLevel]}
                        >
                          {t(recommendationImpactLabelKeys[recommendation.impactLevel])}
                        </Badge>
                        <Badge variant="default">
                          {t(recommendationEffortLabelKeys[recommendation.effort])}
                        </Badge>
                      </div>

                      <div className={s.content}>
                        <p className={s.recommendationTitle}>{recommendation.title}</p>
                        <p className={s.description}>{recommendation.description}</p>
                        <p className={s.action}>{recommendation.action}</p>

                        <div className={s.meta}>
                          {recommendation.categories.map((category) => (
                            <span className={s.category} key={category}>
                              {t(recommendationCategoryLabelKeys[category])}
                            </span>
                          ))}
                          {recommendation.source ? (
                            <span className={s.source}>
                              {t('recommendations.source', {
                                source: recommendation.source,
                              })}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      ) : (
        <p className={s.emptyState}>{t('recommendations.empty')}</p>
      )}
    </Card>
  );
};
