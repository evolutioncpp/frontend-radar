import clsx from 'clsx';

import s from './SectionHeader.module.scss';

import type { ReactNode } from 'react';

interface SectionHeaderProps {
  label: string;
  title: string;
  action?: ReactNode;
  aside?: ReactNode;
  className?: string;
  titleAfter?: ReactNode;
}

export const SectionHeader = ({
  action,
  aside,
  className,
  label,
  title,
  titleAfter,
}: SectionHeaderProps) => {
  return (
    <div className={clsx(s.sectionHeader, className)}>
      <div className={s.main}>
        <div className={s.labelRow}>
          <p className={s.label}>{label}</p>
          {action ? <div className={s.action}>{action}</div> : null}
        </div>

        <div className={s.titleRow}>
          <h2 className={s.title}>{title}</h2>
          {titleAfter}
        </div>
      </div>

      {aside ? <div className={s.aside}>{aside}</div> : null}
    </div>
  );
};
