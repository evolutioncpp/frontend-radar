import clsx from 'clsx';

import s from './Card.module.scss';

import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div className={clsx(s.card, className)} {...props}>
      {children}
    </div>
  );
};
