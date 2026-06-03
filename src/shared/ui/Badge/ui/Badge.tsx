import clsx from 'clsx';

import s from './Badge.module.scss';

import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

export const Badge = ({ children, className, variant = 'default', ...props }: BadgeProps) => {
  return (
    <span className={clsx(s.badge, s[`badge_${variant}`], className)} {...props}>
      {children}
    </span>
  );
};
