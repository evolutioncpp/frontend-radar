import clsx from 'clsx';

import s from './Button.module.scss';

import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isFullWidth?: boolean;
}

export const Button = ({
  children,
  className,
  isFullWidth = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        s.button,
        s[`button_${variant}`],
        isFullWidth && s.buttonFullWidth,
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};
