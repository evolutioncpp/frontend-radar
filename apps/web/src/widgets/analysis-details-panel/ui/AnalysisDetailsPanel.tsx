import { ChevronDown, FileSearch, Layers3 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  reportAnalysisSourceStatusLabelKeys,
  reportToolingGroupLabelKeys,
  reportToolingGroupOrder,
} from '@/entities/report';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './AnalysisDetailsPanel.module.scss';

import type {
  AnalysisSource,
  ProjectReport,
  ReportSignalStatus,
  ToolingItem,
} from '@/entities/report';
import type { ReactNode } from 'react';

interface AnalysisDetailsPanelProps {
  analysisSources: ProjectReport['analysisSources'];
  tooling: ProjectReport['tooling'];
  headerAction?: ReactNode;
}

const sourceScopes = [
  'project',
  'root',
  'repository',
  'github',
] as const satisfies readonly AnalysisSource['scope'][];

const statusVariantMap = {
  found: 'success',
  missing: 'danger',
  warning: 'warning',
} as const satisfies Record<ReportSignalStatus, 'success' | 'danger' | 'warning'>;

const getPrimaryToolingItem = (items: ToolingItem[]) => {
  return (
    items.find((item) => item.status === 'found') ??
    items.find((item) => item.status === 'warning') ??
    items[0] ??
    null
  );
};

export const AnalysisDetailsPanel = ({
  analysisSources,
  headerAction,
  tooling,
}: AnalysisDetailsPanelProps) => {
  const { t } = useTranslation('dashboard');
  const sourcesByScope = useMemo(() => {
    return sourceScopes.map((scope) => ({
      scope,
      sources: analysisSources.filter((source) => source.scope === scope),
    }));
  }, [analysisSources]);

  return (
    <Card aria-label={t('analysisDetails.label')} className={s.analysisDetailsPanel}>
      <SectionHeader
        action={headerAction}
        label={t('analysisDetails.label')}
        title={t('analysisDetails.title')}
      />

      <div className={s.toolingSection}>
        <div className={s.subHeader}>
          <Layers3 aria-hidden="true" className={s.subHeaderIcon} strokeWidth={2} />
          <h3>{t('analysisDetails.tooling.title')}</h3>
        </div>

        <dl className={s.toolingGrid}>
          {reportToolingGroupOrder.map((group) => {
            const item = getPrimaryToolingItem(tooling[group]);
            const primarySource = item?.sources[0] ?? null;

            return (
              <div className={s.toolingItem} key={group}>
                <dt>{t(reportToolingGroupLabelKeys[group])}</dt>
                <dd>
                  {item ? (
                    <>
                      <div className={s.toolingTitleRow}>
                        <span className={s.toolingName}>{item.label}</span>
                        <Badge variant={statusVariantMap[item.status]}>
                          {t(reportAnalysisSourceStatusLabelKeys[item.status])}
                        </Badge>
                      </div>

                      {primarySource ? (
                        <div className={s.toolingSourcePreview}>
                          <span className={s.toolingSourcePreviewLabel}>{primarySource.label}</span>
                        </div>
                      ) : null}

                      {item.sources.length > 1 ? (
                        <details className={s.toolingSourcesDisclosure}>
                          <summary className={s.toolingSourcesSummary}>
                            <ChevronDown
                              aria-hidden="true"
                              className={s.toolingSourcesSummaryIcon}
                              strokeWidth={2}
                            />
                            <span>{t('analysisDetails.tooling.sourcesTitle')}</span>
                            <span className={s.toolingSourcesSummaryMeta}>
                              {t('analysisDetails.tooling.sourcesCounter', {
                                count: item.sources.length,
                              })}
                            </span>
                          </summary>
                          <ul className={s.toolingSourcesList}>
                            {item.sources.map((source) => (
                              <li className={s.toolingSourceItem} key={source.raw}>
                                <span className={s.toolingSourceLabel}>{source.label}</span>
                                {source.detail ? (
                                  <span className={s.toolingSourceDetail}>{source.detail}</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </>
                  ) : (
                    <span className={s.toolingName}>{t('analysisDetails.empty')}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <details className={s.sourcesDisclosure}>
        <summary className={s.sourcesSummary}>
          <ChevronDown aria-hidden="true" className={s.sourcesSummaryIcon} strokeWidth={2} />
          <FileSearch aria-hidden="true" className={s.sourcesSummaryLeadingIcon} strokeWidth={2} />
          <span>{t('analysisDetails.sources.title')}</span>
          <span className={s.sourcesSummaryMeta}>
            {t('analysisDetails.sources.counter', { count: analysisSources.length })}
          </span>
        </summary>

        <div className={s.sourcesGroups}>
          {sourcesByScope.map(({ scope, sources }) =>
            sources.length > 0 ? (
              <section className={s.sourcesGroup} key={scope}>
                <h3>{t(`analysisDetails.sources.scopes.${scope}`)}</h3>
                <ul className={s.sourcesList}>
                  {sources.map((source) => (
                    <li className={s.sourceItem} key={source.id}>
                      <div className={s.sourceMain}>
                        <span className={s.sourceLabel}>{source.label}</span>
                        {source.description ? (
                          <span className={s.sourceDescription}>{source.description}</span>
                        ) : null}
                        {source.source ? (
                          <span className={s.sourcePath}>
                            {t('analysisDetails.sources.source', { source: source.source })}
                          </span>
                        ) : null}
                      </div>
                      <Badge variant={statusVariantMap[source.status]}>
                        {t(reportAnalysisSourceStatusLabelKeys[source.status])}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      </details>
    </Card>
  );
};
