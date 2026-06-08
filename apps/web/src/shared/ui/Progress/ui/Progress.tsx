import clsx from 'clsx';

import s from './Progress.module.scss';

import type { CSSProperties, HTMLAttributes } from 'react';

interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  max?: number;
}

type ProgressStyle = CSSProperties & {
  '--progress-value': string;
};

export const Progress = ({ className, max = 100, style, value, ...props }: ProgressProps) => {
  const safeValue = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? Math.round((safeValue / max) * 100) : 0;

  return (
    <div
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={clsx(s.progress, className)}
      role="progressbar"
      style={
        {
          ...style,
          '--progress-value': `${percentage}%`,
        } as ProgressStyle
      }
      {...props}
    />
  );
};
