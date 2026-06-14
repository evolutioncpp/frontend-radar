import { CircleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/shared/ui/Card';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import s from './ReportComparisonPanel.module.scss';

import type { UnavailableReportComparison } from '@/entities/report';
import type { ReactNode } from 'react';

interface ReportComparisonUnavailablePanelProps {
  headerAction?: ReactNode;
  reason?: UnavailableReportComparison['reason'];
}

const reasonCopyKeys = {
  not_found: 'comparison.unavailable.reasons.notFound',
  not_completed: 'comparison.unavailable.reasons.notCompleted',
  same_report: 'comparison.unavailable.reasons.sameReport',
  different_repository: 'comparison.unavailable.reasons.differentRepository',
  different_project_path: 'comparison.unavailable.reasons.differentProjectPath',
  different_branch: 'comparison.unavailable.reasons.differentBranch',
  different_score_categories: 'comparison.unavailable.reasons.differentScoreCategories',
} as const satisfies Record<NonNullable<UnavailableReportComparison['reason']>, string>;

export const ReportComparisonUnavailablePanel = ({
  headerAction,
  reason,
}: ReportComparisonUnavailablePanelProps) => {
  const { t } = useTranslation('dashboard');
  const reasonKey = reason ? reasonCopyKeys[reason] : 'comparison.unavailable.reasons.default';

  return (
    <Card aria-label={t('comparison.label')} className={s.comparisonPanel}>
      <SectionHeader
        action={headerAction}
        label={t('comparison.label')}
        title={t('comparison.unavailable.title')}
      />

      <div className={s.unavailableMessage} role="status">
        <CircleAlert className={s.unavailableIcon} aria-hidden="true" strokeWidth={2} />
        <div className={s.unavailableCopy}>
          <p className={s.unavailableDescription}>{t('comparison.unavailable.description')}</p>
          <p className={s.unavailableReason}>{t(reasonKey)}</p>
        </div>
      </div>
    </Card>
  );
};
