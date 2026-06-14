import { GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import { ComparisonChangeGroups } from './ComparisonChangeGroups';
import { ComparisonSummaryGrid } from './ComparisonSummaryGrid';
import s from './ReportComparisonPanel.module.scss';
import { toneClassNames } from './reportComparisonStyles';
import { createReportComparisonViewModel } from '../model/reportComparisonViewModel';

import type { ReportComparison } from '../model/reportComparisonViewModel';
import type { ReactNode } from 'react';

interface ReportComparisonPanelProps {
  branch?: string | null;
  comparison: ReportComparison;
  headerAction?: ReactNode;
  mode?: 'automatic' | 'manual';
}

export const ReportComparisonPanel = ({
  branch,
  comparison,
  headerAction,
  mode = 'automatic',
}: ReportComparisonPanelProps) => {
  const { t } = useTranslation('dashboard');
  const titleKey = mode === 'manual' ? 'comparison.manualTitle' : 'comparison.title';
  const descriptionKey =
    mode === 'manual' ? 'comparison.manualDescription' : 'comparison.description';
  const viewModel = createReportComparisonViewModel(comparison);

  return (
    <Card aria-label={t('comparison.label')} className={s.comparisonPanel}>
      <SectionHeader action={headerAction} label={t('comparison.label')} title={t(titleKey)} />

      <p className={s.description}>{t(descriptionKey)}</p>

      {branch ? (
        <p className={s.contextMeta}>
          <GitBranch aria-hidden="true" className={s.contextMetaIcon} strokeWidth={2} />
          <span>{t('comparison.branchContext', { branch })}</span>
        </p>
      ) : null}

      <ComparisonSummaryGrid comparison={comparison} viewModel={viewModel} />

      {!viewModel.hasAnyChanges ? (
        <div className={`${s.noChanges} ${toneClassNames.neutral}`} role="status">
          <h3 className={s.sectionTitle}>{t('comparison.noChangesTitle')}</h3>
          <p className={s.emptyState}>{t('comparison.noChangesDescription')}</p>
        </div>
      ) : (
        <ComparisonChangeGroups comparison={comparison} viewModel={viewModel} />
      )}
    </Card>
  );
};
