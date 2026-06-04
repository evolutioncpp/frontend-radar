import clsx from 'clsx';

import s from '../DashboardPage.module.scss';

import type { DashboardSectionId } from '../../model/dashboardSections';
import type { ReactNode } from 'react';

interface DashboardReportSectionProps {
  id: DashboardSectionId;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}

export const DashboardReportSection = ({
  ariaLabel,
  children,
  className,
  id,
}: DashboardReportSectionProps) => {
  return (
    <section aria-label={ariaLabel} className={clsx(s.section, className)} id={id}>
      {children}
    </section>
  );
};
