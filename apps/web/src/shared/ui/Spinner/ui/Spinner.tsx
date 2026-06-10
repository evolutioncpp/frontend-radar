import clsx from 'clsx';

import s from './Spinner.module.scss';

export type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  className?: string;
  label?: string;
  size?: SpinnerSize;
}

export const Spinner = ({ className, label, size = 'md' }: SpinnerProps) => {
  const spinner = (
    <span
      aria-hidden="true"
      className={clsx(s.spinner, s[`spinner_${size}`], !label && className)}
    />
  );

  if (!label) {
    return spinner;
  }

  return (
    <span className={clsx(s.spinnerRoot, className)} role="status">
      {spinner}
      <span className={s.spinnerLabel}>{label}</span>
    </span>
  );
};
