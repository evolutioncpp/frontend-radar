import { Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getDashboardSectionUrl } from '@/features/dashboard-section-navigation';
import { CopyButton } from '@/shared/ui/CopyButton';

import { dashboardSectionLabelKeys, type DashboardSectionId } from '../../model/dashboardSections';

interface DashboardSectionCopyButtonProps {
  sectionId: DashboardSectionId;
}

export const DashboardSectionCopyButton = ({ sectionId }: DashboardSectionCopyButtonProps) => {
  const { t } = useTranslation('dashboard');

  const sectionName = t(dashboardSectionLabelKeys[sectionId]);

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
