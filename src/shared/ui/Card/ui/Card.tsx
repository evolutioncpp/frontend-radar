import clsx from 'clsx';

import s from './Card.module.scss';

import type { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'flat' | 'outlined';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
}

export const Card = ({ children, className, variant = 'flat', ...props }: CardProps) => {
  return (
    <div className={clsx(s.card, s[`card_${variant}`], className)} {...props}>
      {children}
    </div>
  );
};
