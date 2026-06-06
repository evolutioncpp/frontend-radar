import { Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getDashboardSectionUrl } from '@/features/dashboard-section-navigation';
import {
  dashboardSectionPageLabelKeys,
  type DashboardSectionId,
} from '@/shared/config/navigation/dashboardSections';
import { CopyButton } from '@/shared/ui/CopyButton';

interface DashboardSectionCopyButtonProps {
  sectionId: DashboardSectionId;
}

export const DashboardSectionCopyButton = ({ sectionId }: DashboardSectionCopyButtonProps) => {
  const { t } = useTranslation('dashboard');

  const sectionName = t(dashboardSectionPageLabelKeys[sectionId]);

  return (
    <CopyButton
      ariaLabel={t('page.copySectionLink', {
        section: sectionName,
      })}
      copiedTitle={t('page.copied')}
      icon={LinkIcon}
      title={t('page.copySectionTitle')}
      value={() => getDashboardSectionUrl(sectionId)}
    />
  );
};
