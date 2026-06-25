import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { type ProjectReport } from '@/entities/report';
import { downloadFile } from '@/shared/lib/download-file';
import { Button } from '@/shared/ui/Button';

import {
  createReportMarkdownExport,
  reportMarkdownMimeType,
  type ReportExportTranslator,
} from '../model/reportExport';

import type { ButtonHTMLAttributes } from 'react';

interface ReportExportButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick'
> {
  report: ProjectReport;
}

export const ReportExportButton = ({ report, ...props }: ReportExportButtonProps) => {
  const { i18n, t } = useTranslation('dashboard');

  const exportReport = () => {
    const reportExport = createReportMarkdownExport(report, {
      locale: i18n.language,
      t: t as ReportExportTranslator,
    });

    downloadFile({
      content: reportExport.content,
      filename: reportExport.filename,
      mimeType: reportMarkdownMimeType,
    });
  };

  return (
    <Button
      aria-label={t('reportExport.buttonAria')}
      onClick={exportReport}
      title={t('reportExport.buttonAria')}
      type="button"
      variant="secondary"
      {...props}
    >
      <Download aria-hidden="true" strokeWidth={2} />
      {t('reportExport.button')}
    </Button>
  );
};
